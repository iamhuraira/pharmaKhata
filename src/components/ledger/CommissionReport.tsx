'use client';
import { Card, Typography, Row, Col, Statistic, Progress, Table, Tag, Space, Button } from 'antd';
import { DownloadOutlined, DollarOutlined, TrophyOutlined, BarChartOutlined } from '@ant-design/icons';
import { useExportReport } from '@/hooks/ledger';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface CommissionReportProps {
  commission: any;
  isLoading: boolean;
  month: string;
}

const CommissionReport = ({ commission, isLoading, month }: CommissionReportProps) => {
  const { exportReport, isLoading: isExporting } = useExportReport();

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      await exportReport({
        month,
        type: 'ledger',
        format
      });
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Text>Loading commission report...</Text>
      </div>
    );
  }

  if (!commission) {
    return (
      <div className="text-center py-8">
        <Text type="secondary">No commission data available for this month</Text>
      </div>
    );
  }

  const { rules, totalSales, commissionEarned } = commission;

  // Calculate commission breakdown by tiers
  const calculateTierBreakdown = () => {
    const breakdown = [];
    let remainingAmount = totalSales;
    let totalCommission = 0;

    for (const rule of rules) {
      if (remainingAmount <= 0) break;

      let tierAmount = 0;
      if (rule.maxAmount === null) {
        // No upper limit
        tierAmount = Math.max(0, remainingAmount - rule.minAmount);
      } else {
        tierAmount = Math.max(0, Math.min(remainingAmount, rule.maxAmount - rule.minAmount));
      }

      if (tierAmount > 0) {
        const tierCommission = (tierAmount * rule.ratePct) / 100;
        totalCommission += tierCommission;

        breakdown.push({
          tier: `${rule.minAmount.toLocaleString()} - ${rule.maxAmount ? rule.maxAmount.toLocaleString() : '∞'}`,
          amount: tierAmount,
          rate: rule.ratePct,
          commission: tierCommission,
          percentage: (tierCommission / commissionEarned) * 100
        });

        remainingAmount -= tierAmount;
      }
    }

    return breakdown;
  };

  const tierBreakdown = calculateTierBreakdown();

  const columns = [
    {
      title: 'Sales Tier',
      dataIndex: 'tier',
      key: 'tier',
      render: (tier: string) => (
        <Text strong>{tier} PKR</Text>
      ),
    },
    {
      title: 'Amount in Tier',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text>{amount.toLocaleString()} PKR</Text>
      ),
      align: 'right' as const,
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate: number) => (
        <Tag color="blue">{rate}%</Tag>
      ),
      align: 'center' as const,
    },
    {
      title: 'Commission',
      dataIndex: 'commission',
      key: 'commission',
      render: (commission: number) => (
        <Text strong className="text-green-600">
          {commission.toLocaleString()} PKR
        </Text>
      ),
      align: 'right' as const,
    },
    {
      title: 'Percentage of Total',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => (
        <div>
          <div className="mb-1">
            <Text>{percentage.toFixed(1)}%</Text>
          </div>
          <Progress 
            percent={percentage} 
            strokeColor="#3f8600"
            showInfo={false}
            size="small"
          />
        </div>
      ),
      align: 'center' as const,
    },
  ];

  return (
    <div>
      {/* Header with Export */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Title level={4} className="!mb-2">Commission Report</Title>
          <Text type="secondary">Commission calculation for {dayjs(month).format('MMMM YYYY')}</Text>
        </div>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleExport('csv')}
            loading={isExporting}
            size="small"
          >
            Export CSV
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleExport('pdf')}
            loading={isExporting}
            size="small"
          >
            Export PDF
          </Button>
        </Space>
      </div>

      {/* Commission Overview */}
      <Card title="Commission Overview" className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card size="small" className="text-center">
              <Statistic
                title="Total Sales"
                value={totalSales}
                precision={2}
                valueStyle={{ color: '#1890ff' }}
                suffix="PKR"
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card size="small" className="text-center">
              <Statistic
                title="Commission Earned"
                value={commissionEarned}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                suffix="PKR"
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card size="small" className="text-center">
              <Statistic
                title="Effective Rate"
                value={totalSales > 0 ? (commissionEarned / totalSales) * 100 : 0}
                precision={2}
                valueStyle={{ color: '#722ed1' }}
                suffix="%"
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Commission Rules */}
      <Card title="Commission Rules" className="mb-6">
        <div className="space-y-4">
          <Text strong className="block">Tiered Commission Structure:</Text>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rules.map((rule: any, index: number) => (
              <Card key={index} size="small" className="text-center">
                <div className="space-y-2">
                  <div>
                    <Text strong className="block">Tier {index + 1}</Text>
                    <Text type="secondary" className="text-sm">
                      {rule.minAmount.toLocaleString()} - {rule.maxAmount ? rule.maxAmount.toLocaleString() : '∞'} PKR
                    </Text>
                  </div>
                  <div>
                    <Tag color="blue" className="text-lg">
                      {rule.ratePct}%
                    </Tag>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs">
                      {rule.basis} based
                    </Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      {/* Commission Breakdown */}
      <Card title="Commission Breakdown by Tiers" className="mb-6">
        <Table
          columns={columns}
          dataSource={tierBreakdown}
          rowKey={(_, index) => index?.toString() || '0'}
          pagination={false}
          size="small"
          className="commission-breakdown-table"
        />
      </Card>

      {/* Commission Calculation Details */}
      <Card title="Calculation Details" className="mb-6">
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <Text strong className="block mb-2">How Commission is Calculated:</Text>
            <div className="space-y-2 text-sm">
              <Text type="secondary">
                • Commission is calculated on a tiered basis
              </Text>
              <Text type="secondary">
                • Each tier has a different commission rate
              </Text>
              <Text type="secondary">
                • Higher sales volumes earn higher commission rates
              </Text>
              <Text type="secondary">
                • Total commission = Sum of (Tier Amount × Tier Rate)
              </Text>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text strong className="block mb-2">Example Calculation:</Text>
              <div className="space-y-1 text-sm">
                <Text type="secondary">
                  • Sales: 150,000 PKR
                </Text>
                <Text type="secondary">
                  • Tier 1 (0-100k): 100,000 × 10% = 10,000 PKR
                </Text>
                <Text type="secondary">
                  • Tier 2 (100k-500k): 50,000 × 12% = 6,000 PKR
                </Text>
                <Text type="secondary">
                  • Total Commission: 16,000 PKR
                </Text>
              </div>
            </div>
            
            <div>
              <Text strong className="block mb-2">Benefits:</Text>
              <div className="space-y-1 text-sm">
                <Text type="secondary">
                  • Incentivizes higher sales performance
                </Text>
                <Text type="secondary">
                  • Rewards consistent business growth
                </Text>
                <Text type="secondary">
                  • Transparent and predictable structure
                </Text>
                <Text type="secondary">
                  • Aligns with business objectives
                </Text>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card title="Summary" className="bg-blue-50">
        <div className="text-center">
          <Title level={4} className="!mb-2 text-blue-600">
            Commission Summary for {dayjs(month).format('MMMM YYYY')}
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Text strong className="block">Total Sales</Text>
              <Text className="text-lg text-blue-600">
                {totalSales.toLocaleString()} PKR
              </Text>
            </div>
            <div>
              <Text strong className="block">Commission Earned</Text>
              <Text className="text-lg text-green-600">
                {commissionEarned.toLocaleString()} PKR
              </Text>
            </div>
            <div>
              <Text strong className="block">Effective Rate</Text>
              <Text className="text-lg text-purple-600">
                {totalSales > 0 ? (commissionEarned / totalSales * 100).toFixed(2) : '0'}%
              </Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CommissionReport;
