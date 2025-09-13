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

  // Debug: Log the summary data to see what we're receiving
  console.log('🔍 Ledger Summary Data:', summary);
  console.log('🔍 Total Credit:', summary?.totals?.credit);
  console.log('🔍 Total Debit:', summary?.totals?.debit);
  console.log('🔍 Opening Balance:', summary?.openingBalance);
  console.log('🔍 Closing Balance:', summary?.totals?.closingBalance);

  // Calculate running balance for each transaction (MONTH-SPECIFIC)
  const transactionsWithRunningBalance = transactions.reduce((acc: any[], transaction: any, index: number) => {
    if (index === 0) {
      // First transaction of the month: opening balance + current transaction impact
      const openingBalance = summary?.openingBalance || 0;
      const transactionImpact = (transaction.credit || 0) - (transaction.debit || 0);
      const runningBalance = openingBalance + transactionImpact;
      
      console.log(`🔍 Month: ${selectedMonth} - Transaction ${index + 1}: Credit=${transaction.credit}, Debit=${transaction.debit}, Impact=${transactionImpact}, Opening=${openingBalance}, Running=${runningBalance}`);
      
      acc.push({
        ...transaction,
        calculatedRunningBalance: runningBalance
      });
    } else {
      // Subsequent transactions of the month: previous running balance + current transaction impact
      const previousTransaction = acc[index - 1];
      const previousBalance = previousTransaction.calculatedRunningBalance;
      const transactionImpact = (transaction.credit || 0) - (transaction.debit || 0);
      const runningBalance = previousBalance + transactionImpact;
      
      console.log(`🔍 Month: ${selectedMonth} - Transaction ${index + 1}: Credit=${transaction.credit}, Debit=${transaction.debit}, Impact=${transactionImpact}, Previous=${previousBalance}, Running=${runningBalance}`);
      
      acc.push({
        ...transaction,
        calculatedRunningBalance: runningBalance
      });
    }
    
    return acc;
  }, []);

  // Debug: Show monthly summary
  console.log(`🔍 Monthly Summary for ${selectedMonth}:`);
  console.log(`  - Opening Balance: ${summary?.openingBalance || 0}`);
  console.log(`  - Monthly Credits: ${summary?.totals?.credit || 0}`);
  console.log(`  - Monthly Debits: ${summary?.totals?.debit || 0}`);
  console.log(`  - Closing Balance: ${summary?.totals?.closingBalance || 0}`);
  console.log(`  - Transactions Count: ${transactions.length}`);

  const { isLoading: summaryLoading } = useGetMonthlySummary(selectedMonth);

  // Handle transaction creation success
  const handleTransactionCreated = () => {
    setIsCreateModalOpen(false);
    refetchTransactions();
    message.success('Transaction created successfully!');
  };

  // Filter transactions based on search query (now handled inline in the table)

  // Calculate statistics
  const totalCredit = summary?.totals?.credit || 0;
  const totalDebit = summary?.totals?.debit || 0;
  const netCashFlow = totalCredit - totalDebit;
  const transactionCount = transactions.length;

  // Calculate new metrics for Monthly Cash In Hand and Usage
  const companyRemitTotal = transactions?.filter((t: any) => t.type === 'company_remit').reduce((sum: number, t: any) => sum + (t.debit || 0), 0) || 0;
  const expenseTotal = transactions?.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + (t.debit || 0), 0) || 0;
  const commissionTotal = transactions?.filter((t: any) => t.type === 'commission').reduce((sum: number, t: any) => sum + (t.debit || 0), 0) || 0;
  
  // Cash In Hand = Total Credit - (Transfer To Company + Expenses + Commission)
  const cashInHand = totalCredit - (companyRemitTotal + expenseTotal + commissionTotal);

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
      dataIndex: 'calculatedRunningBalance',
      key: 'calculatedRunningBalance',
      render: (_: number, record: any) => {
        // Use calculated running balance if available, otherwise fall back to database value
        const runningBalance = record.calculatedRunningBalance !== undefined ? record.calculatedRunningBalance : (record.runningBalance || 0);
        
        return (
          <Text strong className={runningBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
            PKR {runningBalance.toLocaleString()}
          </Text>
        );
      },
      sorter: (a: any, b: any) => {
        const balanceA = a.calculatedRunningBalance !== undefined ? a.calculatedRunningBalance : (a.runningBalance || 0);
        const balanceB = b.calculatedRunningBalance !== undefined ? b.calculatedRunningBalance : (b.runningBalance || 0);
        return balanceA - balanceB;
      },
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

      {/* Monthly Cash In Hand and Usage */}
      <Card title="My Monthly Cash In Hand and Usage" className="mb-6">
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={4}>
            <Card className="text-center" size="small">
              <Statistic
                title="Total Cash"
                value={totalCredit}
                precision={2}
                suffix="PKR"
                valueStyle={{ color: '#52c41a' }}
                prefix={<DollarOutlined />}
              />
              <Text type="secondary" className="text-xs">Credit Only</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card className="text-center" size="small">
              <Statistic
                title="Transfer To Company"
                value={companyRemitTotal}
                precision={2}
                suffix="PKR"
                valueStyle={{ color: '#722ed1' }}
                prefix={<DollarOutlined />}
              />
              <Text type="secondary" className="text-xs">Company Remit</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card className="text-center" size="small">
              <Statistic
                title="Expenses"
                value={expenseTotal}
                precision={2}
                suffix="PKR"
                valueStyle={{ color: '#cf1322' }}
                prefix={<DollarOutlined />}
              />
              <Text type="secondary" className="text-xs">All Expenses</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card className="text-center" size="small">
              <Statistic
                title="Commission"
                value={commissionTotal}
                precision={2}
                suffix="PKR"
                valueStyle={{ color: '#fa8c16' }}
                prefix={<DollarOutlined />}
              />
              <Text type="secondary" className="text-xs">Commission Paid</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card className="text-center" size="small">
              <Statistic
                title="Cash In Hand"
                value={cashInHand}
                precision={2}
                suffix="PKR"
                valueStyle={{ color: cashInHand >= 0 ? '#52c41a' : '#cf1322' }}
                prefix={<DollarOutlined />}
              />
              <Text type="secondary" className="text-xs">After All Deductions</Text>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Monthly Balance Progression */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Opening Balance"
              value={summary?.openingBalance || 0}
              precision={2}
              suffix="PKR"
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="text-xs text-gray-500 mt-1">
              Balance at start of {dayjs(selectedMonth).format('MMMM YYYY')}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Monthly Net Flow"
              value={netCashFlow}
              precision={2}
              suffix="PKR"
              valueStyle={{ color: netCashFlow >= 0 ? '#52c41a' : '#cf1322' }}
            />
            <div className="text-xs text-gray-500 mt-1">
              Net change this month
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Closing Balance"
              value={summary?.totals?.closingBalance || 0}
              precision={2}
              suffix="PKR"
              valueStyle={{ color: '#722ed1' }}
            />
            <div className="text-xs text-gray-500 mt-1">
              Balance at end of {dayjs(selectedMonth).format('MMMM YYYY')}
            </div>
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
      <Card 
        title={`Transactions for ${dayjs(selectedMonth).format('MMMM YYYY')}`}
        extra={
          <div className="text-sm text-gray-500">
            <div>📊 Running Balance shows cumulative balance for this month only</div>
            <div>💡 Starting from Opening Balance: PKR {summary?.openingBalance?.toLocaleString() || '0'}</div>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={transactionsWithRunningBalance.filter((transaction: any) => {
            if (!searchQuery) return true;
            const searchLower = searchQuery.toLowerCase();
            return (
              transaction.description?.toLowerCase().includes(searchLower) ||
              transaction.type?.toLowerCase().includes(searchLower) ||
              transaction.method?.toLowerCase().includes(searchLower) ||
              transaction.ref?.party?.toLowerCase().includes(searchLower) ||
              transaction.ref?.orderId?.toLowerCase().includes(searchLower)
            );
          })}
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
