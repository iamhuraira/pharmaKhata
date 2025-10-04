import React, { useState } from 'react';
import { Modal, Descriptions, Table, Tag, Typography, Card, Row, Col, Statistic, Button, message } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { pdfGenerator } from '../../services/pdfGenerator';

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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
      render: (productName: string, record: any) => (
        <div>
          <div className="font-medium">{productName}</div>
          {record.productId?.packType && (
            <div className="text-sm text-gray-500">Pack: {record.productId.packType}</div>
          )}
          {record.productId?.shortDescription && (
            <div className="text-xs text-gray-400">{record.productId.shortDescription}</div>
          )}
        </div>
      ),
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
    productName: item.productName || item.productId?.name || `Product ID: ${item.productId}` || 'Unknown Product'
  })) || [];

  const subtotal = orderItems.reduce((sum: number, item: any) => sum + item.total, 0);
  const discount = order.totals?.discountTotal || 0;
  const grandTotal = order.totals?.grandTotal || subtotal - discount;
  const amountReceived = order.totals?.amountReceived || 0;
  const advanceUsed = order.totals?.advanceUsed || 0;
  const totalPaid = amountReceived + advanceUsed;
  const balanceDue = order.totals?.balance || (grandTotal - totalPaid);

  const handleDownloadExcel = async () => {
    if (!order) return;
    
    console.log('🚀 Starting Excel download from OrderDetailModal...', {
      orderId: order.orderId || order._id,
      customerName: order.customer?.name || 'N/A'
    });
    
    setIsGeneratingPDF(true);
    try {
      // Prepare order data for Excel generation
      console.log('📋 Preparing order data for Excel generation...');
      const orderData = {
        orderId: order.orderId || order._id,
        createdAt: order.createdAt,
        status: order.status,
        customer: {
          name: order.customer?.name || (order.customer?.id?.firstName && order.customer?.id?.lastName ? 
            `${order.customer.id.firstName} ${order.customer.id.lastName}` : 'N/A'),
          phone: order.customer?.phone || order.customer?.id?.phone || 'N/A',
          email: order.customer?.id?.email || 'N/A',
          address: (() => {
            const currentAddress = order.customer?.id?.currentAddress;
            if (!currentAddress) return 'N/A';
            
            if (typeof currentAddress === 'string') {
              return currentAddress;
            }
            
            // Handle structured address object
            const parts = [];
            if (currentAddress.street) parts.push(currentAddress.street);
            if (currentAddress.city) parts.push(currentAddress.city);
            if (currentAddress.state) parts.push(currentAddress.state);
            if (currentAddress.country && currentAddress.country !== 'Pakistan') {
              parts.push(currentAddress.country);
            }
            
            return parts.length > 0 ? parts.join(', ') : 'N/A';
          })(),
        },
        items: orderItems,
        totals: {
          subtotal,
          discount,
          grandTotal,
          amountReceived,
          advanceUsed,
          balance: balanceDue,
        },
        dueDate: order.dueDate,
        notes: order.notes,
        payment: {
          method: order.payment?.method || 'On Account',
        },
      };

      console.log('📄 Filling Excel template with order data...');
      
      // Define cell mappings for this order - maps data to specific Excel cells
      const cellMappings: { [key: string]: any } = {
        // Header information
        'A1': `INVOICE #${orderData.orderId}`, // Invoice title with order ID in A1
        'F2': orderData.customer?.name || 'N/A',  // Customer name in F2
        'F3': orderData.customer?.address || 'N/A', // Customer address in F3
        'F4': orderData.customer?.phone || 'N/A', // Customer phone in F4
        'F5': orderData.createdAt, // Order creation date in F5
        
        // Payment summary at bottom of template
        'G43': orderData.totals.subtotal, // Subtotal amount in G43
        // 'G45': customer due, // Previous remaining balance (commented out)
        'G46': orderData.totals.grandTotal, // Grand total amount in G46
      };
      
      // Loop through order items to fill them in the Excel template
      // Items start from row 8 (A8, B8, C8, D8, G8) and continue down
      orderData.items.forEach((item: any, index: number) => {
        const rowNumber = index + 8; // Calculate Excel row number (8, 9, 10, etc.)
        
        // Fill item data in the corresponding Excel row
        cellMappings[`A${rowNumber}`] = index + 1; // Item number (1, 2, 3, etc.)
        cellMappings[`B${rowNumber}`] = item.productName; // Product name in column B
        cellMappings[`C${rowNumber}`] = item.qty; // Quantity in column C
        cellMappings[`D${rowNumber}`] = item.price; // Price per unit in column D
        // cellMappings[`E${rowNumber}`] = item.%; // Percentage discount (commented out)
        // cellMappings[`F${rowNumber}`] = item.dixcount; // Number discount (commented out)
        cellMappings[`G${rowNumber}`] = item.total; // Total amount in column G
      });
      
      // Log all cell mappings for debugging
      console.log('📊 Cell mappings:', cellMappings);
      
      await pdfGenerator.fillExcelTemplate(orderData, cellMappings);
      console.log('✅ Excel template filled and downloaded successfully!');
      message.success('Excel file filled and downloaded successfully!');
    } catch (error) {
      console.error('❌ Error filling Excel template:', error);
      message.error('Failed to fill Excel template. Please try again.');
    } finally {
      console.log('🔄 Excel template reading process finished, resetting loading state');
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Modal
      title="Order Details"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="print" icon={<PrinterOutlined />} onClick={() => window.print()}>
          Print
        </Button>,
        <Button 
          key="download" 
          icon={<DownloadOutlined />} 
          onClick={handleDownloadExcel}
          loading={isGeneratingPDF}
          type="primary"
        >
          {isGeneratingPDF ? 'Filling Template...' : 'Fill Template'}
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
              {order.customer?.name || (order.customer?.id?.firstName && order.customer?.id?.lastName ? 
                `${order.customer.id.firstName} ${order.customer.id.lastName}` : 'N/A')}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {order.customer?.phone || order.customer?.id?.phone || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {order.customer?.id?.email || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {(() => {
                const currentAddress = order.customer?.id?.currentAddress;
                if (!currentAddress) return 'N/A';
                
                if (typeof currentAddress === 'string') {
                  return currentAddress;
                }
                
                // Handle structured address object
                const parts = [];
                if (currentAddress.street) parts.push(currentAddress.street);
                if (currentAddress.city) parts.push(currentAddress.city);
                if (currentAddress.state) parts.push(currentAddress.state);
                if (currentAddress.country && currentAddress.country !== 'Pakistan') {
                  parts.push(currentAddress.country);
                }
                
                return parts.length > 0 ? parts.join(', ') : 'N/A';
              })()}
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
