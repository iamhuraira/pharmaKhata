                                                                    'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Card, Typography, Button, Avatar, Tag, Tabs, List, Statistic, Row, Col, Empty, Spin, Popconfirm, message, Modal, Input } from 'antd';
  import { UserOutlined, PhoneOutlined, EnvironmentOutlined, CalendarOutlined, DollarOutlined, PlusOutlined, MailOutlined, CreditCardOutlined, DeleteOutlined } from '@ant-design/icons';
import CustomerPaymentModal from '@/components/customer-management/CustomerPaymentModal';
import CustomerDeletionModal from '@/components/customer-management/CustomerDeletionModal';
import PhoneInput from '@/components/customer-management/PhoneInput';
import { useGetCustomerById, useGetCustomerTransactions, useRecordPayment } from '@/hooks/customer';
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
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    whatsappNumber: ''
  });
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  
  const { customer, isLoading: customerLoading, error: customerError } = useGetCustomerById(customerId);
  const { transactions, summary, isLoading: transactionsLoading, error: transactionsError } = useGetCustomerTransactions(customerId);
  const { orders: allOrders } = useGetOrders();
  const { recordPayment, isLoading: isRecordingPayment } = useRecordPayment();

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

  const handleDelete = () => {
    setIsDeletionModalOpen(true);
  };

  const handleDeletionSuccess = () => {
    message.success('Customer deleted successfully');
    window.location.href = '/dashboard/customer-management';
  };

  const handleEditClick = () => {
    if (customer) {
      setEditForm({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
        whatsappNumber: customer.whatsappNumber || ''
      });
      setIsPhoneValid(true); // Assume current phone is valid
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = async () => {
    if (!isPhoneValid) {
      message.error('Please enter a valid phone number');
      return;
    }

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        message.success('Customer updated successfully');
        setIsEditModalOpen(false);
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        const error = await response.json();
        message.error(error.message || 'Failed to update customer');
      }
    } catch (error) {
      console.error('Update error:', error);
      message.error('Failed to update customer');
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
  let totalPayments = summary?.totalPayments || 0;
  const totalAdvances = summary?.totalAdvances || 0;
  const totalAdvanceAllocations = summary?.totalAdvanceAllocations || 0;
  
  // Get current balance directly from customer object (new approach)
  const currentBalance = customer.balance || 0;
  
  // Debug logging for summary data
  console.log(`🔍 Customer ${customerId} - Summary:`, summary);
  console.log(`🔍 Customer ${customerId} - Transactions:`, transactions);
  console.log(`🔍 Customer ${customerId} - Total Payments:`, totalPayments);
  console.log(`🔍 Customer ${customerId} - Total Advances:`, totalAdvances);
  console.log(`🔍 Customer ${customerId} - Total Advance Allocations:`, totalAdvanceAllocations);
  console.log(`🔍 Customer ${customerId} - Current Balance from DB:`, currentBalance);
  console.log(`🔍 Customer ${customerId} - Full customer object:`, customer);
  console.log(`🔍 Customer ${customerId} - Address fields:`, {
    currentAddress: customer.currentAddress,
    address: customer.address,
    addressKeys: customer.currentAddress ? Object.keys(customer.currentAddress) : 'No currentAddress',
    addressType: typeof customer.currentAddress
  });
  
  // Filter orders for this customer
  const customerOrders = allOrders.filter((order: any) => {
    // Handle both customer.id (string) and customer._id (string) cases
    let orderCustomerId = order.customer?.id || order.customer?._id;
    
    // If customer is a full object, try to get the ID from it
    if (typeof orderCustomerId === 'object' && orderCustomerId !== null) {
      orderCustomerId = orderCustomerId.id || orderCustomerId._id;
    }
    
    return orderCustomerId === customerId;
  });
  
  const outstandingOrders = customerOrders.filter((order: any) => 
    order.status === 'created' || order.status === 'partial'
  );
  
  // Debug logging
  console.log(`🔍 Customer ${customerId} - All orders:`, allOrders);
  console.log(`🔍 Customer ${customerId} - Filtered orders:`, customerOrders);
  console.log(`🔍 Customer ${customerId} - Outstanding orders:`, outstandingOrders);
  
  // Fallback: Calculate payments from orders if summary is 0
  if (totalPayments === 0 && customerOrders.length > 0) {
    totalPayments = customerOrders.reduce((sum: number, order: any) => {
      const amountReceived = order.totals?.amountReceived || 0;
      console.log(`🔍 Order ${order.orderId || order.id} - Amount Received:`, amountReceived);
      return sum + amountReceived;
    }, 0);
    console.log(`🔍 Fallback Total Payments calculated from orders:`, totalPayments);
  }
  
  // Calculate outstanding amount from orders (more accurate for current state)
  const totalOutstandingAmount = outstandingOrders.reduce((sum: number, order: any) => {
    const balance = order.totals?.balance || 0;
    return sum + balance;
  }, 0);
  
  // Use the balance from database for current balance display
  // If customer owes money, show negative balance
  // If they have advance, show positive balance
  const displayBalance = currentBalance;

  return (
    <div className="px-2 py-4">
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
          
          <div className="flex items-center space-x-3">
            <Button 
              type="default"
              icon={<UserOutlined />}
              onClick={handleEditClick}
              className="border-blue-300 hover:border-blue-400"
            >
              Edit Customer
            </Button>
            <Popconfirm
              title="Delete Customer"
              description="Are you sure you want to delete this customer? This action cannot be undone."
              onConfirm={handleDelete}
              okText="Yes, Delete"
              cancelText="Cancel"
              okType="danger"
            >
              <Button 
                danger
                icon={<DeleteOutlined />}
                className="border-red-300 hover:border-red-400"
              >
                Delete Customer
              </Button>
            </Popconfirm>
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
      </div>

              {/* Customer Stats */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center" bodyStyle={{ padding: '16px 12px' }}>
            <Statistic
              title="Current Balance"
              value={Math.abs(displayBalance)}
              precision={2}
              valueStyle={{ 
                color: displayBalance >= 0 ? '#3f8600' : '#cf1322',
                fontSize: '24px',
                fontWeight: 'bold'
              }}
              suffix="PKR"
              prefix={displayBalance < 0 ? "-" : ""}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center" bodyStyle={{ padding: '16px 12px' }}>
            <Statistic
              title="Total Orders"
              value={customerOrders.length}
              suffix="orders"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center" bodyStyle={{ padding: '16px 12px' }}>
            <Statistic
              title="Total Order Value"
              value={totalOrders}
              precision={2}
              suffix="PKR"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center" bodyStyle={{ padding: '16px 12px' }}>
            <Statistic
              title="Total Payments"
              value={totalPayments}
              precision={2}
              suffix="PKR"
            />
          </Card>
        </Col>

      </Row>

      {/* Outstanding Orders & Due Amount */}
      <Card title="Outstanding Orders & Due Amount" className="mb-6" bodyStyle={{ padding: '16px 12px' }}>
        <Row gutter={16}>
                      <Col xs={24} md={12}>
              <Card className="text-center border-2 border-orange-200 bg-orange-50" bodyStyle={{ padding: '16px 12px' }}>
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
              <Card className="text-center border-2 border-red-200 bg-red-50" bodyStyle={{ padding: '16px 12px' }}>
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
                {displayBalance < 0 ? 'After advance allocation' : 'Net amount owed'}
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
                       {displayBalance < 0 && (
                         <div>• Advance of {Math.abs(displayBalance).toLocaleString()} PKR already applied</div>
                       )}
                     </div>
                   </>
                 ) : displayBalance < 0 ? (
                   <>
                     <div className="flex items-center space-x-2">
                       <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                       <Text strong className="text-green-600 text-xl">
                         Customer has advance: {Math.abs(displayBalance).toLocaleString()} PKR
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
        
        {/* Financial Summary */}
        <Card title="Financial Summary" className="mb-6" bodyStyle={{ padding: '16px 12px' }}>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Text strong className="text-blue-600 text-lg">Net Position</Text>
                <div className="mt-2">
                  {displayBalance < 0 ? (
                    <Text strong className="text-red-600 text-2xl">
                      -{Math.abs(displayBalance).toLocaleString()} PKR
                    </Text>
                  ) : displayBalance > 0 ? (
                    <Text strong className="text-green-600 text-2xl">
                      +{displayBalance.toLocaleString()} PKR
                    </Text>
                  ) : (
                    <Text strong className="text-gray-600 text-2xl">
                      0.00 PKR
                    </Text>
                  )}
                </div>
                <Text type="secondary" className="text-sm">
                  {displayBalance < 0 ? 'Customer owes this amount' : 
                   displayBalance > 0 ? 'Customer has advance credit' : 
                   'Account is balanced'}
                </Text>
              </div>
            </Col>
            <Col xs={24} md={6}>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <Text strong className="text-green-600 text-lg">Order Count</Text>
                <div className="mt-2">
                  <Text strong className="text-green-600 text-2xl">
                    {customerOrders.length}
                  </Text>
                </div>
                <Text type="secondary" className="text-sm">
                  Number of orders placed
                </Text>
              </div>
            </Col>
            <Col xs={24} md={6}>
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Text strong className="text-purple-600 text-lg">Order Value</Text>
                <div className="mt-2">
                  <Text strong className="text-purple-600 text-2xl">
                    {totalOrders.toLocaleString()} PKR
                  </Text>
                </div>
                <Text type="secondary" className="text-sm">
                  Total value of all orders
                </Text>
              </div>
            </Col>
            <Col xs={24} md={6}>
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Text strong className="text-blue-600 text-lg">Payment Breakdown</Text>
                <div className="mt-2">
                  <Text strong className="text-blue-600 text-lg">
                    {totalPayments.toLocaleString()} PKR
                  </Text>
                </div>
                <Text type="secondary" className="text-xs">
                  {totalPayments > 0 ? `Debt: ${(totalPayments - totalAdvances).toLocaleString()} | Advance: ${totalAdvances.toLocaleString()}` : 'No payments'}
                </Text>
              </div>
            </Col>

          </Row>
        </Card>

        {/* Quick Payment Summary */}
        <Card title="Recent Payment Activity" className="mb-6" bodyStyle={{ padding: '16px 12px' }}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <DollarOutlined className="text-green-500 text-2xl mb-2" />
                <Text strong className="text-green-600 text-lg block">Total Payments</Text>
                <Text strong className="text-green-600 text-xl">
                  {totalPayments.toLocaleString()} PKR
                </Text>
                <Text type="secondary" className="text-sm block mt-1">
                  {transactions.filter((t: any) => t.type === 'payment').length} payment(s)
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <DollarOutlined className="text-blue-500 text-2xl mb-2" />
                <Text strong className="text-blue-600 text-lg block">Total Advances</Text>
                <Text strong className="text-blue-600 text-xl">
                  {totalAdvances.toLocaleString()} PKR
                </Text>
                <Text type="secondary" className="text-sm block mt-1">
                  {transactions.filter((t: any) => t.type === 'advance').length} advance(s)
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <CalendarOutlined className="text-orange-500 text-2xl mb-2" />
                <Text strong className="text-orange-600 text-lg block">Outstanding</Text>
                <Text strong className="text-orange-600 text-xl">
                  {totalOutstandingAmount.toLocaleString()} PKR
                </Text>
                <Text type="secondary" className="text-sm block mt-1">
                  {outstandingOrders.length} order(s) pending
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Recent Orders */}
        {customerOrders.length > 0 && (
          <div className="mt-6">
            <Text strong className="text-gray-700 mb-3 block">Recent Orders:</Text>
            <div className="space-y-2">
              {customerOrders.slice(0, 5).map((order: any) => (
                <div key={order._id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg">
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
                    {customer.currentAddress ? (
                      <>
                        {customer.currentAddress.street && `${customer.currentAddress.street}`}
                        {customer.currentAddress.city && `, ${customer.currentAddress.city}`}
                        {customer.currentAddress.state && `, ${customer.currentAddress.state}`}
                        {customer.currentAddress.country && `, ${customer.currentAddress.country}`}
                      </>
                    ) : customer.address ? (
                      typeof customer.address === 'string' 
                        ? customer.address 
                        : `${customer.address.street || ''}${customer.address.city ? `, ${customer.address.city}` : ''}${customer.address.state ? `, ${customer.address.state}` : ''}${customer.address.country ? `, ${customer.address.country}` : ''}`
                    ) : (
                      'Address not specified'
                    )}
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

      {/* Payment Record Section */}
      <Card title="Payment Records" className="mb-6">
        <div className="mb-4">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsPaymentModalOpen(true)}
            className="bg-primary hover:bg-primaryDark"
          >
            Record New Payment
          </Button>
        </div>
        
        {transactionsLoading ? (
          <div className="text-center py-8">
            <Spin size="large" />
            <div className="mt-4">Loading payment records...</div>
          </div>
        ) : transactionsError ? (
          <div className="text-center py-8">
            <Text type="danger">Failed to load payment records</Text>
            <br />
            <Button onClick={() => window.location.reload()} className="mt-2">
              Retry
            </Button>
          </div>
        ) : transactions.filter((t: any) => t.type === 'payment').length === 0 ? (
          <Empty 
            description="No payment records found" 
            className="py-8"
          />
        ) : (
          <div className="space-y-3">
            {transactions
              .filter((t: any) => t.type === 'payment')
              .map((payment: any, index: number) => (
                <div key={payment._id || index} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DollarOutlined className="text-green-500 text-xl" />
                    <div>
                      <Text strong className="text-green-600">
                        {payment.description || 'Payment Received'}
                      </Text>
                      <br />
                      <Text type="secondary" className="text-sm">
                        {formatDate(payment.date)}
                        {payment.ref?.orderId && ` • Order: ${payment.ref.orderId}`}
                        {payment.ref?.txnNo && ` • Ref: ${payment.ref.txnNo}`}
                        {payment.ref?.note && ` • Note: ${payment.ref.note}`}
                      </Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <Text strong className="text-lg text-green-600">
                      +{(payment.credit || 0).toLocaleString()} PKR
                    </Text>
                    <br />
                    <Text type="secondary" className="text-sm capitalize">
                      {payment.method || 'Unknown method'}
                    </Text>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Transactions and Payments */}
      <Card title="Transactions & Payments" bodyStyle={{ padding: '16px 12px' }}>
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
      {/* 
        When recording payments, the following queries will be automatically invalidated:
        - customers (customer list)
        - customer (individual customer data)
        - customerTransactions (transaction history)
        - customerBalance (balance calculations)
        - orders (order list and details)
        - ledger (ledger transactions)
        - reports (monthly summaries, etc.)
        
        This ensures all related data stays in sync after payment recording.
      */}
      <CustomerPaymentModal
        visible={isPaymentModalOpen}
        onCancel={() => setIsPaymentModalOpen(false)}
        onSubmit={async (paymentData) => {
          try {
            await recordPayment(paymentData);
            setIsPaymentModalOpen(false);
            // The hook will automatically refresh the data
          } catch (error) {
            console.error('Payment failed:', error);
            // Error is handled by the hook
          }
        }}
        customerId={customerId}
        customerName={`${customer.firstName} ${customer.lastName}`}
        dueAmount={totalOutstandingAmount}
        loading={isRecordingPayment}
      />

      <CustomerDeletionModal
        visible={isDeletionModalOpen}
        onClose={() => setIsDeletionModalOpen(false)}
        onSuccess={handleDeletionSuccess}
        customerId={customerId}
        customerName={`${customer.firstName} ${customer.lastName}`}
      />

      {/* Edit Customer Modal */}
      <Modal
        title="Edit Customer"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={handleEditSubmit}
        okText="Update Customer"
        cancelText="Cancel"
        okButtonProps={{ disabled: !isPhoneValid }}
        width={600}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">First Name *</label>
            <Input
              value={editForm.firstName}
              onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
              placeholder="Enter first name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Last Name *</label>
            <Input
              value={editForm.lastName}
              onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
              placeholder="Enter last name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number *</label>
            <PhoneInput
              value={editForm.phone}
              onChange={(value) => setEditForm({ ...editForm, phone: value })}
              onValidationChange={setIsPhoneValid}
              excludeUserId={customerId}
              placeholder="Enter phone number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">WhatsApp Number</label>
            <Input
              value={editForm.whatsappNumber}
              onChange={(e) => setEditForm({ ...editForm, whatsappNumber: e.target.value })}
              placeholder="Enter WhatsApp number (optional)"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerDetailPage;
