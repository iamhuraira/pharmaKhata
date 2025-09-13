import React from 'react';
import { Modal, Descriptions, Table, Tag, Typography, Card, Row, Col, Statistic, Button } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface OrderDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  order: any;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  visible,
  onCancel,
  order
}) => {
  if (!order) return null;

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD HH:mm');
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

  const columns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      key: 'qty',
      width: 100,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => `PKR ${price.toLocaleString()}`,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (total: number) => `PKR ${total.toLocaleString()}`,
    },
  ];

  const orderItems = order.items?.map((item: any) => ({
    ...item,
    total: item.qty * item.price,
    productName: item.product?.name || item.productName || 'Unknown Product'
  })) || [];

  const subtotal = orderItems.reduce((sum: number, item: any) => sum + item.total, 0);
  const discount = order.totals?.discountTotal || 0;
  const grandTotal = order.totals?.grandTotal || subtotal - discount;
  const amountReceived = order.totals?.amountReceived || 0;
  const advanceUsed = order.totals?.advanceUsed || 0;
  const totalPaid = amountReceived + advanceUsed;
  const balanceDue = order.totals?.balance || (grandTotal - totalPaid);

  return (
    <Modal
      title="Order Details"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="print" icon={<PrinterOutlined />} onClick={() => window.print()}>
          Print
        </Button>,
        <Button key="download" icon={<DownloadOutlined />}>
          Download PDF
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          Close
        </Button>
      ]}
      width={900}
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Order Header */}
        <Card>
          <Row gutter={16}>
            <Col span={12}>
              <Title level={4}>Order #{order.orderId || order._id}</Title>
              <Text type="secondary">Created: {formatDate(order.createdAt)}</Text>
            </Col>
            <Col span={12} className="text-right">
              <Tag color={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </Tag>
            </Col>
          </Row>
        </Card>

        {/* Customer Information */}
        <Card title="Customer Information">
          <Descriptions column={2}>
            <Descriptions.Item label="Name">
              {order.customer?.firstName} {order.customer?.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {order.customer?.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {order.customer?.email || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {order.customer?.address || 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Order Items */}
        <Card title="Order Items">
          <Table
            columns={columns}
            dataSource={orderItems}
            rowKey={(_record, index) => index?.toString() || '0'}
            pagination={false}
            size="small"
          />
        </Card>

        {/* Payment Information */}
        <Card title="Payment Information">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Payment Method"
                value={order.payment?.method || 'On Account'}
                valueStyle={{ fontSize: '16px' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Amount Received"
                value={amountReceived}
                precision={2}
                suffix="PKR"
                valueStyle={{ color: '#3f8600', fontSize: '16px' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Advance Used"
                value={advanceUsed}
                precision={2}
                suffix="PKR"
                valueStyle={{ color: '#1890ff', fontSize: '16px' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Balance Due"
                value={balanceDue}
                precision={2}
                suffix="PKR"
                valueStyle={{ 
                  color: balanceDue > 0 ? '#cf1322' : '#3f8600',
                  fontSize: '18px'
                }}
              />
            </Col>
          </Row>
          {advanceUsed > 0 && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
              <Text type="secondary">
                <strong>Note:</strong> This order used {advanceUsed.toLocaleString()} PKR from customer's advance balance.
              </Text>
            </div>
          )}
        </Card>

        {/* Order Summary */}
        <Card title="Order Summary">
          <Row gutter={16}>
            <Col span={12}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text>Subtotal:</Text>
                  <Text>PKR {subtotal.toLocaleString()}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Discount:</Text>
                  <Text>PKR {discount.toLocaleString()}</Text>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <Text strong>Grand Total:</Text>
                  <Text strong>PKR {grandTotal.toLocaleString()}</Text>
                </div>
                {advanceUsed > 0 && (
                  <div className="flex justify-between" style={{ color: '#1890ff' }}>
                    <Text>Advance Used:</Text>
                    <Text>PKR {advanceUsed.toLocaleString()}</Text>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold" style={{ color: balanceDue > 0 ? '#cf1322' : '#3f8600' }}>
                  <Text strong>Balance Due:</Text>
                  <Text strong>PKR {balanceDue.toLocaleString()}</Text>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text>Due Date:</Text>
                  <Text>{order.dueDate ? formatDate(order.dueDate) : 'N/A'}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Order Status:</Text>
                  <Tag color={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Tag>
                </div>
                <div className="flex justify-between">
                  <Text>Payment Status:</Text>
                  <Tag color={balanceDue > 0 ? 'warning' : 'success'}>
                    {balanceDue > 0 ? 'Pending' : 'Complete'}
                  </Tag>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card title="Notes">
            <Text>{order.notes}</Text>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
