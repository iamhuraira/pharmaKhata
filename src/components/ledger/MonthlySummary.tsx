import React from 'react';
import { Modal, Card, Typography, Row, Col, Statistic, Progress, Table, Tag } from 'antd';
import { DollarOutlined, ArrowUpOutlined, ArrowDownOutlined, BarChartOutlined } from '@ant-design/icons';
import { useGetMonthlySummary } from '@/hooks/ledger';
import dayjs from 'dayjs';

const { Text } = Typography;

interface MonthlySummaryProps {
  visible: boolean;
  onCancel: () => void;
  month: string;
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  visible,
  onCancel,
  month
}) => {
  const { summary } = useGetMonthlySummary(month);

  if (!summary) return null;

  const formatCurrency = (amount: number) => `PKR ${amount.toLocaleString()}`;
  const formatPercentage = (value: number, total: number) => 
    total > 0 ? `${((value / total) * 100).toFixed(1)}%` : '0%';

  const getCashFlowColor = (value: number) => {
    if (value > 0) return '#52c41a';
    if (value < 0) return '#cf1322';
    return '#1890ff';
  };

  const getCashFlowIcon = (value: number) => {
    if (value > 0) return <ArrowUpOutlined />;
    if (value < 0) return <ArrowDownOutlined />;
    return <BarChartOutlined />;
  };

  const columns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Percentage',
      key: 'percentage',
      render: (record: any) => formatPercentage(record.amount, summary.totalCashIn),
    },
  ];

  const cashInData = [
    { category: 'Cash', amount: summary.cashIn?.bySource?.cash || 0 },
    { category: 'JazzCash', amount: summary.cashIn?.bySource?.jazzcash || 0 },
    { category: 'Bank', amount: summary.cashIn?.bySource?.bank || 0 },
  ].filter(item => item.amount > 0);

  const companyRemitData = [
    { category: 'JazzCash', amount: summary.cashSentToCompany?.byMethod?.jazzcash || 0 },
    { category: 'Bank', amount: summary.cashSentToCompany?.byMethod?.bank || 0 },
  ].filter(item => item.amount > 0);

  return (
    <Modal
      title={`Monthly Summary - ${dayjs(month).format('MMMM YYYY')}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center">
              <Statistic
                title="Opening Balance"
                value={summary.cashInHand?.opening || 0}
                precision={2}
                suffix="PKR"
                valueStyle={{ color: '#1890ff' }}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center">
              <Statistic
                title="Closing Balance"
                value={summary.cashInHand?.closing || 0}
                precision={2}
                suffix="PKR"
                valueStyle={{ color: '#722ed1' }}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center">
              <Statistic
                title="Net Cash Flow"
                value={(summary.cashInHand?.closing || 0) - (summary.cashInHand?.opening || 0)}
                precision={2}
                suffix="PKR"
                valueStyle={{ color: getCashFlowColor((summary.cashInHand?.closing || 0) - (summary.cashInHand?.opening || 0)) }}
                prefix={getCashFlowIcon((summary.cashInHand?.closing || 0) - (summary.cashInHand?.opening || 0))}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center">
              <Statistic
                title="Savings/Profit"
                value={summary.savingsProfit || 0}
                precision={2}
                suffix="PKR"
                valueStyle={{ color: (summary.savingsProfit || 0) >= 0 ? '#52c41a' : '#cf1322' }}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Cash Flow Breakdown */}
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title="Cash In" className="h-full">
              <div className="space-y-4">
                <div className="text-center">
                  <Statistic
                    title="Total Cash In"
                    value={summary.cashIn?.total || 0}
                    precision={2}
                    suffix="PKR"
                    valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                  />
                </div>
                
                {cashInData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Text>{item.category}</Text>
                      <Text strong>{formatCurrency(item.amount)}</Text>
                    </div>
                    <Progress
                      percent={summary.cashIn?.total ? (item.amount / summary.cashIn.total) * 100 : 0}
                      strokeColor="#52c41a"
                      showInfo={false}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Cash Out" className="h-full">
              <div className="space-y-4">
                <div className="text-center">
                  <Statistic
                    title="Total Cash Out"
                    value={summary.cashSentToCompany?.total || 0}
                    precision={2}
                    suffix="PKR"
                    valueStyle={{ color: '#cf1322', fontSize: '24px' }}
                  />
                </div>
                
                {companyRemitData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Text>{item.category}</Text>
                      <Text strong>{formatCurrency(item.amount)}</Text>
                    </div>
                    <Progress
                      percent={summary.cashSentToCompany?.total ? (item.amount / summary.cashSentToCompany.total) * 100 : 0}
                      strokeColor="#cf1322"
                      showInfo={false}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Business Performance */}
        <Row gutter={16}>
          <Col xs={24} lg={8}>
            <Card title="Sales Performance" className="text-center">
              <Statistic
                title="Monthly Sales"
                value={summary.sales?.monthlyTotal || 0}
                precision={2}
                suffix="PKR"
                valueStyle={{ color: '#52c41a', fontSize: '20px' }}
              />
              <div className="mt-4">
                <Text type="secondary">Total sales for the month</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Purchase Performance" className="text-center">
              <Statistic
                title="Monthly Purchases"
                value={summary.purchases?.monthlyTotal || 0}
                precision={2}
                suffix="PKR"
                valueStyle={{ color: '#faad14', fontSize: '20px' }}
              />
              <div className="mt-4">
                <Text type="secondary">Total purchases for the month</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Expense Overview" className="text-center">
              <Statistic
                title="Total Expenses"
                value={summary.expenses?.total || 0}
                precision={2}
                suffix="PKR"
                valueStyle={{ color: '#cf1322', fontSize: '20px' }}
              />
              <div className="mt-4">
                <Text type="secondary">Operating expenses</Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Additional Metrics */}
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title="Commission & Stock">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Text>Commission Earned:</Text>
                  <Text strong className="text-green-600">
                    {formatCurrency(summary.commission || 0)}
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text>Remaining Stock Value:</Text>
                  <Text strong className="text-blue-600">
                    {formatCurrency(summary.stock?.remainingValue || 0)}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Financial Health">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Text>Cash Position:</Text>
                  <Tag color={summary.cashInHand?.closing && summary.cashInHand.closing > 0 ? 'success' : 'error'}>
                    {summary.cashInHand?.closing && summary.cashInHand.closing > 0 ? 'Healthy' : 'Low'}
                  </Tag>
                </div>
                <div className="flex justify-between items-center">
                  <Text>Profitability:</Text>
                  <Tag color={(summary.savingsProfit || 0) >= 0 ? 'success' : 'error'}>
                    {(summary.savingsProfit || 0) >= 0 ? 'Profitable' : 'Loss'}
                  </Tag>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Detailed Tables */}
        <Card title="Cash In Breakdown">
          <Table
            columns={columns}
            dataSource={cashInData}
            rowKey="category"
            pagination={false}
            size="small"
          />
        </Card>

        <Card title="Company Remittance Breakdown">
          <Table
            columns={columns}
            dataSource={companyRemitData}
            rowKey="category"
            pagination={false}
            size="small"
          />
        </Card>

        {/* Summary Notes */}
        <Card title="Summary Notes" className="bg-blue-50">
          <div className="space-y-2 text-sm">
            <Text>
              • Opening Balance: {formatCurrency(summary.cashInHand?.opening || 0)}
            </Text>
            <Text>
              • Total Cash In: {formatCurrency(summary.cashIn?.total || 0)}
            </Text>
            <Text>
              • Total Cash Out: {formatCurrency(summary.cashSentToCompany?.total || 0)}
            </Text>
            <Text>
              • Closing Balance: {formatCurrency(summary.cashInHand?.closing || 0)}
            </Text>
            <Text>
              • Net Cash Flow: {formatCurrency((summary.cashInHand?.closing || 0) - (summary.cashInHand?.opening || 0))}
            </Text>
            <Text>
              • Monthly Profit/Loss: {formatCurrency(summary.savingsProfit || 0)}
            </Text>
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default MonthlySummary;
