'use client';
import React, { useState } from 'react';
import { Card, Typography, Button, Table, Tag, Input, Space, Row, Col, Statistic, DatePicker, Select, message } from 'antd';
import { PlusOutlined, DollarOutlined, BarChartOutlined, FileTextOutlined } from '@ant-design/icons';
import { useGetLedgerTransactions, useGetMonthlySummary } from '@/hooks/ledger';
import CreateTransactionModal from '@/components/ledger/CreateTransactionModal';
import MonthlySummary from '@/components/ledger/MonthlySummary';
import LedgerTransactions from '@/components/ledger/LedgerTransactions';
import LoadingSpinner from '@/components/LoadingSpinner';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;


const LedgerPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [transactionType, setTransactionType] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMonthlySummaryOpen, setIsMonthlySummaryOpen] = useState(false);
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);

  const { transactions, summary, isLoading: transactionsLoading, refetch: refetchTransactions } = useGetLedgerTransactions({
    month: selectedMonth,
    type: transactionType || undefined,
    method: paymentMethod || undefined,
    q: searchQuery || undefined
  });

  const { isLoading: summaryLoading } = useGetMonthlySummary(selectedMonth);

  // Handle transaction creation success
  const handleTransactionCreated = () => {
    setIsCreateModalOpen(false);
    refetchTransactions();
    message.success('Transaction created successfully!');
  };

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter((transaction: any) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      transaction.description?.toLowerCase().includes(searchLower) ||
      transaction.type?.toLowerCase().includes(searchLower) ||
      transaction.method?.toLowerCase().includes(searchLower) ||
      transaction.ref?.party?.toLowerCase().includes(searchLower) ||
      transaction.ref?.orderId?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate statistics
  const totalCredit = summary?.totalCredit || 0;
  const totalDebit = summary?.totalDebit || 0;
  const netCashFlow = totalCredit - totalDebit;
  const transactionCount = transactions.length;

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

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => formatDate(date),
      sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      defaultSortOrder: 'descend' as const,
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
      filters: [
        { text: 'Sale', value: 'sale' },
        { text: 'Payment', value: 'payment' },
        { text: 'Advance', value: 'advance' },
        { text: 'Expense', value: 'expense' },
        { text: 'Company Remit', value: 'company_remit' },
        { text: 'Commission', value: 'commission' },
      ],
      onFilter: (value: any, record: any) => record.type === value,
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
      filters: [
        { text: 'Cash', value: 'cash' },
        { text: 'JazzCash', value: 'jazzcash' },
        { text: 'Bank', value: 'bank' },
        { text: 'Card', value: 'card' },
      ],
      onFilter: (value: any, record: any) => record.method === value,
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
        </div>
      ),
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
    },
  ];

  if (transactionsLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="!mb-2">Ledger Management</Title>
            <Text type="secondary">Track all financial transactions, cash flow, and business performance</Text>
          </div>
          <Space>
            <Button
              icon={<BarChartOutlined />}
              onClick={() => setIsMonthlySummaryOpen(true)}
            >
              Monthly Summary
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => setIsTransactionsOpen(true)}
            >
              View All Transactions
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
              size="large"
              className="bg-primary hover:bg-primaryDark"
            >
              New Transaction
            </Button>
          </Space>
        </div>
      </div>

      {/* Month Selection */}
      <Card className="mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <Text strong>Select Month:</Text>
          </div>
          <DatePicker
            picker="month"
            value={dayjs(selectedMonth)}
            onChange={(date) => setSelectedMonth(date ? date.format('YYYY-MM') : dayjs().format('YYYY-MM'))}
            format="YYYY-MM"
          />
          <div className="text-sm text-gray-500">
            {dayjs(selectedMonth).format('MMMM YYYY')}
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Total Credit"
              value={totalCredit}
              precision={2}
              suffix="PKR"
              valueStyle={{ color: '#52c41a' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Total Debit"
              value={totalDebit}
              precision={2}
              suffix="PKR"
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Net Cash Flow"
              value={netCashFlow}
              precision={2}
              suffix="PKR"
              valueStyle={{ color: netCashFlow >= 0 ? '#52c41a' : '#cf1322' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Transactions"
              value={transactionCount}
              valueStyle={{ color: '#1890ff' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Opening/Closing Balance */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12}>
          <Card className="text-center">
            <Statistic
              title="Opening Balance"
              value={summary?.openingBalance || 0}
              precision={2}
              suffix="PKR"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card className="text-center">
            <Statistic
              title="Closing Balance"
              value={summary?.closingBalance || 0}
              precision={2}
              suffix="PKR"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <div>
              <Text strong className="block mb-2">Transaction Type:</Text>
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
          <Col xs={24} sm={8}>
            <div>
              <Text strong className="block mb-2">Payment Method:</Text>
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
          <Col xs={24} sm={8}>
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

      {/* Transactions Table */}
      <Card title={`Transactions for ${dayjs(selectedMonth).format('MMMM YYYY')}`}>
        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey={(record) => record._id || record.id}
          loading={transactionsLoading}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} transactions`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modals */}
      <CreateTransactionModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={handleTransactionCreated}
      />

      <MonthlySummary
        visible={isMonthlySummaryOpen}
        onCancel={() => setIsMonthlySummaryOpen(false)}
        month={selectedMonth}
      />

      <LedgerTransactions
        visible={isTransactionsOpen}
        onCancel={() => setIsTransactionsOpen(false)}
        month={selectedMonth}
      />
    </div>
  );
};

export default LedgerPage;
