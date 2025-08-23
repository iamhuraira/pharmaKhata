'use client';
import { useState } from 'react';
import { Table, Tag, Space, Button, Input, Select, Typography, Tooltip } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { useExportReport } from '@/hooks/ledger';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

interface LedgerTransactionsProps {
  ledger: any;
  isLoading: boolean;
  month: string;
}

const LedgerTransactions = ({ ledger, isLoading, month }: LedgerTransactionsProps) => {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');

  const { exportReport, isLoading: isExporting } = useExportReport();

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'green';
      case 'purchase':
        return 'blue';
      case 'expense':
        return 'red';
      case 'payment':
        return 'orange';
      case 'company_remit':
        return 'purple';
      case 'commission':
        return 'cyan';
      case 'advance':
        return 'gold';
      case 'refund':
        return 'volcano';
      case 'adjustment':
        return 'geekblue';
      default:
        return 'default';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'green';
      case 'jazzcash':
        return 'blue';
      case 'bank':
        return 'purple';
      case 'card':
        return 'orange';
      case 'advance':
        return 'gold';
      default:
        return 'default';
    }
  };

  const formatReference = (ref: any) => {
    if (!ref) return '-';
    
    const parts = [];
    if (ref.orderId) parts.push(`Order: ${ref.orderId}`);
    if (ref.party) parts.push(`Party: ${ref.party}`);
    if (ref.txnNo) parts.push(`TXN: ${ref.txnNo}`);
    if (ref.voucher) parts.push(`Voucher: ${ref.voucher}`);
    
    return parts.length > 0 ? parts.join(', ') : '-';
  };

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

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => (
        <div>
          <div className="font-semibold">{dayjs(date).format('MMM DD, YYYY')}</div>
          <div className="text-sm text-gray-500">{dayjs(date).format('HH:mm')}</div>
        </div>
      ),
      sorter: (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <Text code className="text-xs">{id}</Text>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTransactionTypeColor(type)} className="capitalize">
          {type.replace('_', ' ')}
        </Tag>
      ),
      filters: [
        { text: 'Sale', value: 'sale' },
        { text: 'Purchase', value: 'purchase' },
        { text: 'Expense', value: 'expense' },
        { text: 'Payment', value: 'payment' },
        { text: 'Company Remit', value: 'company_remit' },
        { text: 'Commission', value: 'commission' },
        { text: 'Advance', value: 'advance' },
        { text: 'Refund', value: 'refund' },
        { text: 'Adjustment', value: 'adjustment' },
      ],
      onFilter: (value: any, record: any) => record.type === value,
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => (
        <Tag color={getPaymentMethodColor(method)} className="capitalize">
          {method}
        </Tag>
      ),
      filters: [
        { text: 'Cash', value: 'cash' },
        { text: 'JazzCash', value: 'jazzcash' },
        { text: 'Bank', value: 'bank' },
        { text: 'Card', value: 'card' },
        { text: 'Advance', value: 'advance' },
        { text: 'Other', value: 'other' },
      ],
      onFilter: (value: any, record: any) => record.method === value,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <div className="max-w-xs">
          <Text className="line-clamp-2">{description}</Text>
        </div>
      ),
      ellipsis: true,
    },
    {
      title: 'Reference',
      dataIndex: 'ref',
      key: 'ref',
      render: (ref: any) => (
        <div className="max-w-xs">
          <Text className="text-sm text-gray-600">{formatReference(ref)}</Text>
        </div>
      ),
      ellipsis: true,
    },
    {
      title: 'Credit',
      dataIndex: 'credit',
      key: 'credit',
      render: (credit: number) => (
        credit > 0 ? (
          <Text strong className="text-green-600">
            +{credit.toLocaleString()} PKR
          </Text>
        ) : (
          <Text className="text-gray-400">-</Text>
        )
      ),
      align: 'right' as const,
    },
    {
      title: 'Debit',
      dataIndex: 'debit',
      key: 'debit',
      render: (debit: number) => (
        debit > 0 ? (
          <Text strong className="text-red-600">
            -{debit.toLocaleString()} PKR
          </Text>
        ) : (
          <Text className="text-gray-400">-</Text>
        )
      ),
      align: 'right' as const,
    },
    {
      title: 'Running Balance',
      dataIndex: 'runningBalance',
      key: 'runningBalance',
      render: (balance: number) => (
        <Text 
          strong 
          className={balance >= 0 ? 'text-green-600' : 'text-red-600'}
        >
          {balance >= 0 ? '+' : ''}{balance.toLocaleString()} PKR
        </Text>
      ),
      align: 'right' as const,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, _record: any) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Edit Transaction">
            <Button type="text" icon={<EditOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Delete Transaction">
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Filter transactions based on search and filters
  const filteredTransactions = (ledger?.transactions || []).filter((txn: any) => {
    const matchesSearch = searchText === '' || 
      txn.description.toLowerCase().includes(searchText.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchText.toLowerCase()) ||
      (txn.ref?.party && txn.ref.party.toLowerCase().includes(searchText.toLowerCase()));
    
    const matchesType = filterType === 'all' || txn.type === filterType;
    const matchesMethod = filterMethod === 'all' || txn.method === filterMethod;
    
    return matchesSearch && matchesType && matchesMethod;
  });

  return (
    <div>
      {/* Filters and Export */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <Text strong className="mr-2">Search:</Text>
            <Input
              placeholder="Search transactions..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
          </div>
          
          <div>
            <Text strong className="mr-2">Type:</Text>
            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="all">All Types</Option>
              <Option value="sale">Sale</Option>
              <Option value="purchase">Purchase</Option>
              <Option value="expense">Expense</Option>
              <Option value="payment">Payment</Option>
              <Option value="company_remit">Company Remit</Option>
              <Option value="commission">Commission</Option>
              <Option value="advance">Advance</Option>
              <Option value="refund">Refund</Option>
              <Option value="adjustment">Adjustment</Option>
            </Select>
          </div>
          
          <div>
            <Text strong className="mr-2">Method:</Text>
            <Select
              value={filterMethod}
              onChange={setFilterMethod}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="all">All Methods</Option>
              <Option value="cash">Cash</Option>
              <Option value="jazzcash">JazzCash</Option>
              <Option value="bank">Bank</Option>
              <Option value="card">Card</Option>
              <Option value="advance">Advance</Option>
              <Option value="other">Other</Option>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2">
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
        </div>
      </div>

      {/* Transactions Table */}
      <Table
        columns={columns}
        dataSource={filteredTransactions}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} transactions`,
        }}
        scroll={{ x: 1200 }}
        size="small"
        className="ledger-transactions-table"
      />

      {/* Summary Footer */}
      {filteredTransactions.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <Text strong>Total Credits:</Text>
                             <div className="text-lg font-semibold text-green-600">
                 {filteredTransactions.reduce((sum: number, txn: any) => sum + txn.credit, 0).toLocaleString()} PKR
               </div>
             </div>
             <div>
               <Text strong>Total Debits:</Text>
               <div className="text-lg font-semibold text-red-600">
                 {filteredTransactions.reduce((sum: number, txn: any) => sum + txn.debit, 0).toLocaleString()} PKR
               </div>
             </div>
             <div>
               <Text strong>Net Flow:</Text>
               <div className={`text-lg font-semibold ${
                 filteredTransactions.reduce((sum: number, txn: any) => sum + txn.credit - txn.debit, 0) >= 0 
                   ? 'text-green-600' 
                   : 'text-red-600'
               }`}>
                 {filteredTransactions.reduce((sum: number, txn: any) => sum + txn.credit - txn.debit, 0).toLocaleString()} PKR
               </div>
             </div>
             <div>
               <Text strong>Transactions:</Text>
               <div className="text-lg font-semibold text-blue-600">
                 {filteredTransactions.length}
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LedgerTransactions;
