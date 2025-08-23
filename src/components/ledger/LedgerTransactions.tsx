import React, { useState } from 'react';
import { Modal, Card, Typography, Table, Tag, Input, Row, Col, DatePicker, Select, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useGetLedgerTransactions } from '@/hooks/ledger';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface LedgerTransactionsProps {
  visible: boolean;
  onCancel: () => void;
  month: string;
}

const LedgerTransactions: React.FC<LedgerTransactionsProps> = ({
  visible,
  onCancel,
  month
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionType, setTransactionType] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const { transactions, summary, isLoading } = useGetLedgerTransactions({
    month: month,
    type: transactionType || undefined,
    method: paymentMethod || undefined,
    q: searchQuery || undefined
  });

  // Filter transactions based on date range if selected
  const filteredTransactions = transactions.filter((transaction: any) => {
    if (!dateRange) return true;
    const transactionDate = dayjs(transaction.date);
    return transactionDate.isAfter(dateRange[0], 'day') && transactionDate.isBefore(dateRange[1], 'day');
  });

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'success';
      case 'payment':
        return 'success';
      case 'advance':
        return 'processing';
      case 'expense':
        return 'error';
      case 'company_remit':
        return 'warning';
      case 'commission':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'sale':
        return 'Sale';
      case 'payment':
        return 'Payment';
      case 'advance':
        return 'Advance';
      case 'expense':
        return 'Expense';
      case 'company_remit':
        return 'Company Remit';
      case 'commission':
        return 'Commission';
      default:
        return type?.charAt(0).toUpperCase() + type?.slice(1) || 'Unknown';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'default';
      case 'jazzcash':
        return 'processing';
      case 'bank':
        return 'success';
      case 'card':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD HH:mm');
  };

  const handleExport = () => {
    // Export functionality would go here
    console.log('Exporting transactions...');
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => formatDate(date),
      sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      defaultSortOrder: 'descend' as const,
      width: 150,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTransactionTypeColor(type)}>
          {getTransactionTypeLabel(type)}
        </Tag>
      ),
      width: 120,
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => (
        <Tag color={getPaymentMethodColor(method)}>
          {method?.charAt(0).toUpperCase() + method?.slice(1)}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string, record: any) => (
        <div>
          <div className="font-medium">{description}</div>
          {record.ref?.party && (
            <div className="text-sm text-gray-500">
              Party: {record.ref.party}
            </div>
          )}
          {record.ref?.orderId && (
            <div className="text-sm text-gray-500">
              Order: {record.ref.orderId}
            </div>
          )}
          {record.ref?.txnNo && (
            <div className="text-sm text-gray-500">
              Ref: {record.ref.txnNo}
            </div>
          )}
        </div>
      ),
      width: 250,
    },
    {
      title: 'Credit',
      dataIndex: 'credit',
      key: 'credit',
      render: (credit: number) => (
        credit > 0 ? (
          <Text strong className="text-green-600">
            +PKR {credit.toLocaleString()}
          </Text>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
      sorter: (a: any, b: any) => a.credit - b.credit,
      width: 120,
    },
    {
      title: 'Debit',
      dataIndex: 'debit',
      key: 'debit',
      render: (debit: number) => (
        debit > 0 ? (
          <Text strong className="text-red-600">
            -PKR {debit.toLocaleString()}
          </Text>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
      sorter: (a: any, b: any) => a.debit - b.debit,
      width: 120,
    },
    {
      title: 'Running Balance',
      dataIndex: 'runningBalance',
      key: 'runningBalance',
      render: (balance: number) => (
        <Text strong className={balance >= 0 ? 'text-green-600' : 'text-red-600'}>
          PKR {balance.toLocaleString()}
        </Text>
      ),
      sorter: (a: any, b: any) => a.runningBalance - b.runningBalance,
      width: 140,
    },
  ];

  return (
    <Modal
      title={`All Transactions - ${dayjs(month).format('MMMM YYYY')}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1400}
      destroyOnClose
    >
      <div className="space-y-4">
        {/* Summary Statistics */}
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card size="small" className="text-center">
              <Text strong>Total Credit</Text>
              <div className="text-lg font-bold text-green-600">
                PKR {(summary?.totalCredit || 0).toLocaleString()}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" className="text-center">
              <Text strong>Total Debit</Text>
              <div className="text-lg font-bold text-red-600">
                PKR {(summary?.totalDebit || 0).toLocaleString()}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" className="text-center">
              <Text strong>Net Flow</Text>
              <div className={`text-lg font-bold ${(summary?.totalCredit || 0) - (summary?.totalDebit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                PKR {((summary?.totalCredit || 0) - (summary?.totalDebit || 0)).toLocaleString()}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card size="small">
          <Row gutter={16} align="middle">
            <Col xs={24} sm={6}>
              <div>
                <Text strong className="block mb-2">Type:</Text>
                <Select
                  placeholder="All Types"
                  allowClear
                  value={transactionType}
                  onChange={setTransactionType}
                  className="w-full"
                >
                  <Option value="sale">Sale</Option>
                  <Option value="payment">Payment</Option>
                  <Option value="advance">Advance</Option>
                  <Option value="expense">Expense</Option>
                  <Option value="company_remit">Company Remit</Option>
                  <Option value="commission">Commission</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={6}>
              <div>
                <Text strong className="block mb-2">Method:</Text>
                <Select
                  placeholder="All Methods"
                  allowClear
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  className="w-full"
                >
                  <Option value="cash">Cash</Option>
                  <Option value="jazzcash">JazzCash</Option>
                  <Option value="bank">Bank</Option>
                  <Option value="card">Card</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={6}>
              <div>
                <Text strong className="block mb-2">Date Range:</Text>
                <DatePicker.RangePicker
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                  className="w-full"
                  format="YYYY-MM-DD"
                />
              </div>
            </Col>
            <Col xs={24} sm={6}>
              <div>
                <Text strong className="block mb-2">Search:</Text>
                <Search
                  placeholder="Search transactions..."
                  allowClear
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onSearch={() => {}}
                />
              </div>
            </Col>
          </Row>
        </Card>

        {/* Export Button */}
        <div className="flex justify-end">
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            className="mb-2"
          >
            Export to CSV
          </Button>
        </div>

        {/* Transactions Table */}
        <Card size="small">
          <Table
            columns={columns}
            dataSource={filteredTransactions}
            rowKey={(record) => record._id || record.id}
            loading={isLoading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} transactions`,
            }}
            scroll={{ x: 1200, y: 600 }}
            size="small"
          />
        </Card>

        {/* Transaction Count */}
        <div className="text-center text-sm text-gray-500">
          Showing {filteredTransactions.length} of {transactions.length} transactions
          {dateRange && ` for ${dateRange[0].format('MMM DD')} - ${dateRange[1].format('MMM DD')}`}
        </div>
      </div>
    </Modal>
  );
};

export default LedgerTransactions;
