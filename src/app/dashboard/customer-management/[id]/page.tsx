'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Card, Typography, Button, Avatar, Tag, Tabs, List, Statistic, Row, Col, Empty, Spin } from 'antd';
import { UserOutlined, PhoneOutlined, EnvironmentOutlined, CalendarOutlined, DollarOutlined, PlusOutlined, MailOutlined, CreditCardOutlined } from '@ant-design/icons';
import CustomerPaymentModal from '@/components/customer-management/CustomerPaymentModal';
import { useGetCustomerById, useGetCustomerTransactions } from '@/hooks/customer';
import { useGetOrders } from '@/hooks/order';
import LoadingSpinner from '@/components/LoadingSpinner';

const { Title, Text } = Typography;

// interface Transaction {
//   id: string;
//   type: string;
//   method: string;
//   description: string;
//   debit: number;
//   credit: number;
//   date: string;
//   ref?: {
//     orderId?: string;
//     party?: string;
//     txnNo?: string;
//     note?: string;
//   };
// }

const CustomerDetailPage = () => {
  const params = useParams();
  const customerId = params?.id as string;
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const { customer, isLoading: customerLoading, error: customerError } = useGetCustomerById(customerId);
  const { transactions, summary, isLoading: transactionsLoading, error: transactionsError } = useGetCustomerTransactions(customerId);
  const { orders: allOrders } = useGetOrders();

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <DollarOutlined className="text-green-500" />;
      case 'advance':
        return <DollarOutlined className="text-blue-500" />;
      case 'sale':
      case 'order':
        return <CalendarOutlined className="text-orange-500" />;
      case 'company_remit':
        return <DollarOutlined className="text-red-500" />;
      default:
        return <DollarOutlined />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'text-green-600';
      case 'advance':
        return 'text-blue-600';
      case 'sale':
      case 'order':
        return 'text-orange-600';
      case 'company_remit':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'blocked':
        return 'error';
      case 'deleted':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'payment':
        return 'Payment';
      case 'advance':
        return 'Advance';
      case 'sale':
        return 'Sale';
      case 'order':
        return 'Order';
      case 'company_remit':
        return 'Company Remittance';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  if (customerLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (customerError || !customer) {
    console.error('Customer detail error:', customerError);
    console.log('Customer ID:', customerId);
    console.log('Customer data:', customer);
    return (
      <div className="p-4 text-center">
        <Title level={3} className="text-red-500">Customer not found</Title>
        <Text>Unable to load customer information for ID: {customerId}</Text>
        <br />
        <Button 
          onClick={() => window.history.back()} 
          className="mt-4"
        >
          Back to Customers
        </Button>
      </div>
    );
  }

  // Calculate real-time statistics
  const totalOrders = summary?.totalOrders || 0;
  const totalPayments = summary?.totalPayments || 0;
  const totalAdvances = summary?.totalAdvances || 0;
  // const totalAdvanceAllocations = summary?.totalAdvanceAllocations || 0;
  const currentBalance = customer.balance || 0;
  
  // Calculate outstanding amount from transactions (more accurate)
  const outstandingAmount = summary?.outstandingAmount || 0;
  
  // Filter orders for this customer
  const customerOrders = allOrders.filter((order: any) => order.customer?.id === customerId);
  const outstandingOrders = customerOrders.filter((order: any) => 
    order.status === 'created' || order.status === 'partial'
  );
  
  // Use the more accurate outstanding amount from transactions
  const totalOutstandingAmount = outstandingAmount > 0 ? outstandingAmount : 0;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <Button 
          onClick={() => window.history.back()} 
          className="mb-4"
          icon={<span>←</span>}
        >
          Back to Customers
        </Button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar 
              size={64} 
              icon={<UserOutlined />} 
              className="bg-gradient-to-br from-primary to-blue-600"
            />
            <div>
              <Title level={2} className="!mb-1">
                {customer.firstName} {customer.lastName}
              </Title>
              <Tag color={getStatusColor(customer.status || 'active')}>
                {customer.status || 'active'}
              </Tag>
            </div>
          </div>
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsPaymentModalOpen(true)}
            className="bg-primary hover:bg-primaryDark"
          >
            Record Payment
          </Button>
        </div>
      </div>

      {/* Customer Stats */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Current Balance"
              value={currentBalance}
              precision={2}
              valueStyle={{ 
                color: currentBalance >= 0 ? '#3f8600' : '#cf1322',
                fontSize: '24px',
                fontWeight: 'bold'
              }}
              suffix="PKR"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Total Orders"
              value={totalOrders}
              precision={2}
              suffix="PKR"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Total Payments"
              value={totalPayments}
              precision={2}
              suffix="PKR"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Total Advances"
              value={totalAdvances}
              precision={2}
              suffix="PKR"
            />
          </Card>
        </Col>
      </Row>

      {/* Outstanding Orders & Due Amount */}
      <Card title="Outstanding Orders & Due Amount" className="mb-6">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Card className="text-center border-2 border-orange-200 bg-orange-50">
              <Statistic
                title="Outstanding Orders Count"
                value={outstandingOrders.length}
                valueStyle={{ 
                  color: '#d97706',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}
                suffix="orders"
              />
              <Text type="secondary" className="text-sm">
                {outstandingOrders.length > 0 ? 'Orders pending payment' : 'All orders paid'}
              </Text>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="text-center border-2 border-red-200 bg-red-50">
              <Statistic
                title="Total Due Amount"
                value={totalOutstandingAmount}
                precision={2}
                valueStyle={{ 
                  color: '#dc2626',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}
                suffix="PKR"
              />
              <Text type="secondary" className="text-sm">
                {currentBalance < 0 ? 'After advance allocation' : 'Net amount owed'}
              </Text>
            </Card>
          </Col>
        </Row>
        
                 {/* Payment Status & Actions */}
         <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
           <div className="flex items-center justify-between">
             <div className="flex-1">
               <Text strong className="text-gray-700 text-lg">Payment Status:</Text>
               <div className="mt-2 space-y-2">
                 {totalOutstandingAmount > 0 ? (
                   <>
                     <div className="flex items-center space-x-2">
                       <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                       <Text strong className="text-red-600 text-xl">
                         Customer needs to pay: {totalOutstandingAmount.toLocaleString()} PKR
                       </Text>
                     </div>
                     <div className="text-sm text-gray-600 ml-5">
                       {outstandingOrders.length > 0 && (
                         <div>• {outstandingOrders.length} order(s) have outstanding balance</div>
                       )}
                       {currentBalance < 0 && (
                         <div>• Advance of {Math.abs(currentBalance).toLocaleString()} PKR already applied</div>
                       )}
                     </div>
                   </>
                 ) : currentBalance < 0 ? (
                   <>
                     <div className="flex items-center space-x-2">
                       <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                       <Text strong className="text-green-600 text-xl">
                         Customer has advance: {Math.abs(currentBalance).toLocaleString()} PKR
                       </Text>
                     </div>
                     <div className="text-sm text-gray-600 ml-5">
                       • This amount can be used for future orders
                     </div>
                   </>
                 ) : (
                   <>
                     <div className="flex items-center space-x-2">
                       <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                       <Text strong className="text-green-600 text-xl">
                         Account is balanced - No amount due
                       </Text>
                     </div>
                     <div className="text-sm text-gray-600 ml-5">
                       • All orders are paid in full
                     </div>
                   </>
                 )}
               </div>
             </div>
             
             {totalOutstandingAmount > 0 && (
               <div className="ml-6">
                 <Button 
                   type="primary" 
                   size="large"
                   icon={<DollarOutlined />}
                   onClick={() => setIsPaymentModalOpen(true)}
                   className="bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600"
                 >
                   Collect {totalOutstandingAmount.toLocaleString()} PKR
                 </Button>
               </div>
             )}
           </div>
         </div>
        
        {/* Recent Orders */}
        {customerOrders.length > 0 && (
          <div className="mt-6">
            <Text strong className="text-gray-700 mb-3 block">Recent Orders:</Text>
            <div className="space-y-2">
              {customerOrders.slice(0, 5).map((order: any) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Text strong className="text-blue-600">{order.orderId}</Text>
                      <Tag color={order.status === 'paid' ? 'success' : order.status === 'partial' ? 'warning' : 'default'}>
                        {order.status}
                      </Tag>
                    </div>
                    <Text type="secondary" className="text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                  <div className="text-right">
                    <Text strong className="text-lg">
                      {order.totals?.grandTotal?.toLocaleString()} PKR
                    </Text>
                    {order.totals?.balance > 0 && (
                      <div className="text-sm text-red-600">
                        Due: {order.totals.balance.toLocaleString()} PKR
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Customer Information */}
      <Card title="Customer Information" className="mb-6">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <PhoneOutlined className="text-blue-500" />
                <div>
                  <Text strong>Phone:</Text>
                  <Text className="ml-2">{customer.phone}</Text>
                </div>
              </div>
              
              {customer.email && (
                <div className="flex items-center space-x-3">
                  <MailOutlined className="text-blue-500" />
                  <div>
                    <Text strong>Email:</Text>
                    <Text className="ml-2">{customer.email}</Text>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-3">
                <EnvironmentOutlined className="text-green-500 mt-1" />
                <div>
                  <Text strong>Address:</Text>
                  <Text className="ml-2">
                    {customer.address || 'Address not specified'}
                  </Text>
                </div>
              </div>
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <div className="space-y-3">
              {customer.creditLimit && (
                <div className="flex items-center space-x-3">
                  <CreditCardOutlined className="text-purple-500" />
                  <div>
                    <Text strong>Credit Limit:</Text>
                    <Text className="ml-2">{customer.creditLimit.toLocaleString()} PKR</Text>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <CalendarOutlined className="text-purple-500" />
                <div>
                  <Text strong>Created:</Text>
                  <Text className="ml-2">
                    {customer.createdAt ? formatDate(customer.createdAt) : 'N/A'}
                  </Text>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <CalendarOutlined className="text-purple-500" />
                <div>
                  <Text strong>Last Updated:</Text>
                  <Text className="ml-2">
                    {customer.updatedAt ? formatDate(customer.updatedAt) : 'N/A'}
                  </Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Transactions and Payments */}
      <Card title="Transactions & Payments">
        <Tabs 
          defaultActiveKey="transactions"
          items={[
            {
              key: 'transactions',
              label: 'Transaction History',
              children: (
                <>
                  {transactionsLoading ? (
                    <div className="text-center py-8">
                      <Spin size="large" />
                      <div className="mt-4">Loading transactions...</div>
                    </div>
                  ) : transactionsError ? (
                    <div className="text-center py-8">
                      <Text type="danger">Failed to load transactions</Text>
                      <br />
                      <Button onClick={() => window.location.reload()} className="mt-2">
                        Retry
                      </Button>
                    </div>
                  ) : transactions.length === 0 ? (
                    <Empty 
                      description="No transactions found" 
                      className="py-8"
                    />
                  ) : (
                    <List
                      dataSource={transactions}
                      renderItem={(transaction: any) => (
                        <List.Item>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-3">
                              <div className="text-xl">
                                {getTransactionIcon(transaction.type)}
                              </div>
                              <div>
                                <Text strong className={getTransactionColor(transaction.type)}>
                                  {transaction.description}
                                </Text>
                                <br />
                                <Text type="secondary" className="text-sm">
                                  {formatDate(transaction.date)}
                                  {transaction.ref?.orderId && ` • Order: ${transaction.ref.orderId}`}
                                  {transaction.ref?.txnNo && ` • Ref: ${transaction.ref.txnNo}`}
                                </Text>
                              </div>
                            </div>
                            <div className="text-right">
                              <Text 
                                strong 
                                className={`text-lg ${transaction.debit > 0 ? 'text-orange-600' : 'text-green-600'}`}
                              >
                                {transaction.debit > 0 ? '+' : ''}{(transaction.debit > 0 ? (transaction.debit || 0) : (transaction.credit || 0)).toLocaleString()} PKR
                              </Text>
                              <br />
                              <Text type="secondary" className="text-sm capitalize">
                                {getTransactionTypeLabel(transaction.type)}
                                {transaction.method && ` • ${transaction.method}`}
                              </Text>
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  )}
                </>
              )
            },
            {
              key: 'payments',
              label: 'Payment History',
              children: (
                <>
                  {transactionsLoading ? (
                    <div className="text-center py-8">
                      <Spin size="large" />
                      <div className="mt-4">Loading payments...</div>
                    </div>
                  ) : transactionsError ? (
                    <div className="text-center py-8">
                      <Text type="danger">Failed to load payments</Text>
                      <br />
                      <Button onClick={() => window.location.reload()} className="mt-2">
                        Retry
                      </Button>
                    </div>
                  ) : transactions.filter((t: any) => t.type === 'payment').length === 0 ? (
                    <Empty 
                      description="No payments found" 
                      className="py-8"
                    />
                  ) : (
                    <List
                      dataSource={transactions.filter((t: any) => t.type === 'payment')}
                      renderItem={(payment: any) => (
                        <List.Item>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-3">
                              <DollarOutlined className="text-green-500 text-xl" />
                              <div>
                                <Text strong className="text-green-600">
                                  {payment.description}
                                </Text>
                                <br />
                                <Text type="secondary" className="text-sm">
                                  {formatDate(payment.date)}
                                  {payment.ref?.orderId && ` • Order: ${payment.ref.orderId}`}
                                  {payment.ref?.txnNo && ` • Ref: ${payment.ref.txnNo}`}
                                </Text>
                              </div>
                            </div>
                            <div className="text-right">
                              <Text strong className="text-lg text-green-600">
                                {(payment.credit || 0).toLocaleString()} PKR
                              </Text>
                              <br />
                              <Text type="secondary" className="text-sm capitalize">
                                {payment.method || 'Unknown method'}
                              </Text>
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  )}
                </>
              )
            }
          ]}
        />
      </Card>

      {/* Payment Modal */}
      <CustomerPaymentModal
        visible={isPaymentModalOpen}
        onCancel={() => setIsPaymentModalOpen(false)}
        onSubmit={(paymentData) => {
          console.log('Payment submitted:', paymentData);
          setIsPaymentModalOpen(false);
        }}
        customerId={customerId}
        customerName={`${customer.firstName} ${customer.lastName}`}
        dueAmount={totalOutstandingAmount}
      />
    </div>
  );
};

export default CustomerDetailPage;
