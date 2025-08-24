'use client';

import React from 'react';
import { Modal, Avatar, Typography, Tag, Button, Divider, Row, Col, Statistic } from 'antd';
import { UserOutlined, PhoneOutlined, EnvironmentOutlined, DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface CustomerQuickViewProps {
  customer: any;
  visible: boolean;
  onClose: () => void;
  dueAmount: number;
  outstandingOrdersCount: number;
}

export function CustomerQuickView({ 
  customer, 
  visible, 
  onClose, 
  dueAmount, 
  outstandingOrdersCount 
}: CustomerQuickViewProps) {
  const router = useRouter();

  // Don't render anything if no customer or not visible
  if (!customer || !visible) return null;

  const handleEdit = () => {
    onClose();
    // TODO: Implement edit functionality
    console.log('Edit customer:', customer.id);
  };

  const handleDelete = () => {
    onClose();
    // TODO: Implement delete functionality
    console.log('Delete customer:', customer.id);
  };

  const handleOpenFullPage = () => {
    onClose();
    router.push(`/dashboard/customer-management/${customer.id || customer._id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Modal
      title="Customer Quick View"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      destroyOnClose
      className="customer-quickview-modal"
      data-testid="quickview"
    >
      <div className="space-y-6">
        {/* Customer Header */}
        <div className="flex items-center space-x-4">
          <Avatar 
            size={64} 
            icon={<UserOutlined />} 
            className="bg-gradient-to-br from-primary to-blue-600"
          />
          <div className="flex-1">
            <Title level={3} className="!mb-2">
              {customer.firstName} {customer.lastName}
            </Title>
            <Tag color={getStatusColor(customer.status || 'active')} className="text-sm">
              {customer.status || 'active'}
            </Tag>
          </div>
        </div>

        <Divider />

        {/* Contact Information */}
        <div className="space-y-3">
          <Title level={5}>Contact Information</Title>
          <Row gutter={16}>
            <Col span={12}>
              <div className="flex items-center space-x-2 text-gray-600">
                <PhoneOutlined />
                <Text>{customer.phone || 'No phone'}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div className="flex items-center space-x-2 text-gray-600">
                <EnvironmentOutlined />
                <Text>
                  {typeof customer.address === 'string' && customer.address.trim() !== '' 
                    ? customer.address 
                    : 'No address'}
                </Text>
              </div>
            </Col>
          </Row>
          {customer.email && customer.email.trim() !== '' && (
            <div className="flex items-center space-x-2 text-gray-600">
              <EnvironmentOutlined />
              <Text>{customer.email}</Text>
            </div>
          )}
        </div>

        <Divider />

        {/* Financial Summary */}
        <div className="space-y-3">
          <Title level={5}>Financial Summary</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Due Amount"
                value={dueAmount}
                precision={2}
                valueStyle={{ 
                  color: dueAmount > 0 ? '#dc2626' : '#16a34a',
                  fontSize: '18px'
                }}
                suffix="PKR"
                prefix={<DollarOutlined />}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Outstanding Orders"
                value={outstandingOrdersCount}
                valueStyle={{ 
                  color: outstandingOrdersCount > 0 ? '#dc2626' : '#16a34a',
                  fontSize: '18px'
                }}
                prefix={<ShoppingCartOutlined />}
              />
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleEdit} type="default">
            Edit
          </Button>
          <Button onClick={handleDelete} danger>
            Delete
          </Button>
          <Button onClick={handleOpenFullPage} type="primary">
            Open Full Page
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default CustomerQuickView;
