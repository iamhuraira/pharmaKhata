'use client';
import React, { useState } from 'react';
import { Card, Typography, Button, Table, Tag, Input, Space, Row, Col, Statistic, message } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useGetOrders, useRecordOrderPayment } from '@/hooks/order';
import { useGetAllCustomers } from '@/hooks/customer';
import CreateOrderModal from '@/components/order-management/CreateOrderModal';
import OrderDetailModal from '@/components/order-management/OrderDetailModal';
import OrderPaymentModal from '@/components/order-management/OrderPaymentModal';
import LoadingSpinner from '@/components/LoadingSpinner';

const { Title, Text } = Typography;
const { Search } = Input;

const OrderManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { orders, isLoading: ordersLoading, refetch: refetchOrders } = useGetOrders();
  const { isLoading: customersLoading } = useGetAllCustomers();
  const { recordOrderPayment, isLoading: paymentLoading } = useRecordOrderPayment();

  // Filter orders based on search query
  const filteredOrders = orders.filter((order: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.orderId?.toLowerCase().includes(searchLower) ||
      order.customer?.firstName?.toLowerCase().includes(searchLower) ||
      order.customer?.lastName?.toLowerCase().includes(searchLower) ||
      order.customer?.phone?.includes(searchLower) ||
      order.status?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate statistics
  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum: number, order: any) => {
    const orderItems = order.items?.map((item: any) => ({
      total: item.qty * item.price
    })) || [];
    const subtotal = orderItems.reduce((itemSum: number, item: any) => itemSum + item.total, 0);
    return sum + subtotal;
  }, 0);

  const pendingOrders = orders.filter((order: any) => 
    order.status === 'created' || order.status === 'partial'
  ).length;

  const paidOrders = orders.filter((order: any) => 
    order.status === 'paid'
  ).length;

  // Handle order creation success
  const handleOrderCreated = () => {
    setIsCreateModalOpen(false);
    refetchOrders();
    message.success('Order created successfully!');
  };

  // Handle order detail view
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  // Handle order payment
  const handleOrderPayment = (order: any) => {
    setSelectedOrder(order);
    setIsPaymentModalOpen(true);
  };

  // Handle payment submission
  const handlePaymentSubmitted = async (paymentData: any) => {
    try {
      await recordOrderPayment(paymentData);
      setIsPaymentModalOpen(false);
      refetchOrders();
    } catch (error) {
      console.error('Payment error:', error);
      // Error toast is handled by the hook
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created':
        return 'default';
      case 'partial':
        return 'warning';
      case 'paid':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'created':
        return 'Created';
      case 'partial':
        return 'Partial Payment';
      case 'paid':
        return 'Paid';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (orderId: string, record: any) => (
        <Text strong className="text-blue-600">
          {orderId || record._id?.slice(-8)}
        </Text>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (record: any) => (
        <div>
          <div className="font-medium">
            {record.customer?.firstName} {record.customer?.lastName}
          </div>
          <div className="text-sm text-gray-500">
            {record.customer?.phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Items',
      key: 'items',
      render: (record: any) => (
        <div>
          <div className="font-medium">
            {record.items?.length || 0} items
          </div>
          <div className="text-sm text-gray-500">
            {record.items?.[0]?.productName || 'N/A'}
            {record.items?.length > 1 && ` +${record.items.length - 1} more`}
          </div>
        </div>
      ),
    },
    {
      title: 'Total',
      key: 'total',
      render: (record: any) => {
        // Use the totals from the order if available, otherwise calculate
        const grandTotal = record.totals?.grandTotal || 
          record.items?.reduce((sum: number, item: any) => sum + (item.qty * item.price), 0) || 0;
        const discount = record.totals?.discountTotal || record.payment?.discount || 0;
        
        return (
          <div>
            <div className="font-medium">
              PKR {grandTotal.toLocaleString()}
            </div>
            {discount > 0 && (
              <div className="text-sm text-green-600">
                -PKR {discount.toLocaleString()} discount
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Payment',
      key: 'payment',
      render: (record: any) => {
        // Use the totals from the order if available, otherwise calculate
        const grandTotal = record.totals?.grandTotal || 
          record.items?.reduce((sum: number, item: any) => sum + (item.qty * item.price), 0) || 0;
        
        const amountReceived = record.totals?.amountReceived || record.payment?.amountReceived || 0;
        const advanceUsed = record.totals?.advanceUsed || 0;
        const balanceDue = record.totals?.balance || (grandTotal - amountReceived - advanceUsed);

        return (
          <div>
            <div className="font-medium">
              PKR {amountReceived.toLocaleString()}
            </div>
            {advanceUsed > 0 && (
              <div className="text-sm text-blue-600">
                Advance: PKR {advanceUsed.toLocaleString()}
              </div>
            )}
            {balanceDue > 0 ? (
              <div className="text-sm text-red-600">
                Due: PKR {balanceDue.toLocaleString()}
              </div>
            ) : (
              <div className="text-sm text-green-600">
                Fully Paid
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => {
        // Use the totals from the order if available, otherwise calculate
        const grandTotal = record.totals?.grandTotal || 
          record.items?.reduce((sum: number, item: any) => sum + (item.qty * item.price), 0) || 0;
        
        const amountReceived = record.totals?.amountReceived || record.payment?.amountReceived || 0;
        const advanceUsed = record.totals?.advanceUsed || 0;
        const balanceDue = record.totals?.balance || (grandTotal - amountReceived - advanceUsed);

        return (
          <Space>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewOrder(record)}
              size="small"
            >
              View
            </Button>
            {balanceDue > 0 && (
              <Button
                type="text"
                icon={<DollarOutlined />}
                onClick={() => handleOrderPayment(record)}
                size="small"
                className="text-green-600"
              >
                Pay
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  if (ordersLoading || customersLoading) {
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
            <Title level={2} className="!mb-2">Order Management</Title>
            <Text type="secondary">Manage customer orders, payments, and order status</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
            size="large"
            className="bg-primary hover:bg-primaryDark"
          >
            Create Order
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Total Orders"
              value={totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Total Value"
              value={totalValue}
              precision={2}
              suffix="PKR"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Pending Orders"
              value={pendingOrders}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Paid Orders"
              value={paidOrders}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <Search
            placeholder="Search orders by ID, customer name, phone, or status"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <div className="text-sm text-gray-500">
            {filteredOrders.length} of {totalOrders} orders
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey={(record) => record._id || record.orderId}
          loading={ordersLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} orders`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modals */}
      <CreateOrderModal
        visible={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={handleOrderCreated}
      />

      <OrderDetailModal
        visible={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        order={selectedOrder}
      />

      <OrderPaymentModal
        visible={isPaymentModalOpen}
        onCancel={() => setIsPaymentModalOpen(false)}
        onSubmit={handlePaymentSubmitted}
        order={selectedOrder}
        loading={paymentLoading}
      />
    </div>
  );
};

export default OrderManagementPage;
