'use client';
import { Card, Avatar, Tag, Typography, Button, Popconfirm } from 'antd';
import { UserOutlined, PhoneOutlined, EnvironmentOutlined, EditOutlined, DeleteOutlined, MailOutlined, DollarOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Modal, Input, Form, message } from 'antd';
import { useUpdateCustomer, useDeleteCustomer } from '@/hooks/customer';
import { useRouter } from 'next/navigation';

const { Text, Title } = Typography;

interface CustomerCardProps {
  customer: {
    id: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    address?: any;
    status?: string;
    balance?: number;
    creditLimit?: number;
    createdAt?: string;
    updatedAt?: string;
  };
  dueAmount?: number;
  outstandingOrdersCount?: number;
}

const CustomerCard = ({ customer, dueAmount = 0, outstandingOrdersCount = 0 }: CustomerCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const { updateCustomer, isLoading: isUpdating } = useUpdateCustomer();
  const { deleteCustomer, isLoading: isDeleting } = useDeleteCustomer();
  const router = useRouter();

  const handleEdit = () => {
    editForm.setFieldsValue({
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: customer.email,
      address: customer.address?.street || customer.address || '',
      creditLimit: customer.creditLimit,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (values: any) => {
    try {
      await updateCustomer({ id: customer.id, ...values });
      setIsEditModalOpen(false);
      message.success('Customer updated successfully');
    } catch (error) {
      message.error('Failed to update customer');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCustomer(customer.id);
      message.success('Customer deleted successfully');
    } catch (error) {
      message.error('Failed to delete customer');
    }
  };

  const handleCardClick = () => {
    router.push(`/dashboard/customer-management/${customer.id}`);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePhoneClick = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <>
      <Card 
        className='hover:shadow-lg transition-all duration-300 cursor-pointer mx-0 border-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden shadow-sm'
        onClick={handleCardClick}
      >
        <div className='p-4'>
          {/* Header Section with Avatar and Status */}
          <div className='flex items-start justify-between mb-4'>
            <div className='flex items-center space-x-3'>
              <div className='relative'>
                <Avatar 
                  size={56} 
                  icon={<UserOutlined />} 
                  className='bg-gradient-to-br from-primary to-blue-600 flex-shrink-0 shadow-md'
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  customer.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
              <div className='flex-1 min-w-0'>
                <Title level={3} className='!mb-2 !text-lg !font-bold text-gray-800 leading-tight'>
                  {customer.firstName} {customer.lastName}
                </Title>
                <Tag 
                  color={getStatusColor(customer.status || 'active')} 
                  className='text-sm font-semibold px-3 py-1 rounded-full border-0 text-white'
                >
                  {customer.status || 'active'}
                </Tag>
              </div>
            </div>
          </div>
          
          {/* Contact Information Section */}
          <div className='space-y-3 mb-4'>
            {/* Phone - Clickable */}
            {customer.phone && (
              <div className='flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-200'>
                <PhoneOutlined className='text-blue-600 text-lg' />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePhoneClick(customer.phone!);
                  }}
                  className='text-base font-semibold text-blue-700 hover:text-blue-800 transition-colors flex-1 text-left'
                >
                  {customer.phone}
                </button>
              </div>
            )}
            
            {/* Email */}
            {customer.email && (
              <div className='flex items-center space-x-3 p-3 bg-indigo-50 rounded-xl border border-indigo-200'>
                <div className='w-3 h-3 rounded-full bg-indigo-500'></div>
                <Text className='text-base font-medium text-gray-800'>
                  {customer.email}
                </Text>
              </div>
            )}
            
            {/* Address */}
            {customer.address && (
              <div className='flex items-start space-x-3 p-3 bg-green-50 rounded-xl border border-green-200'>
                <EnvironmentOutlined className='text-green-600 text-lg mt-1' />
                <div className='flex-1'>
                  <Text className='text-base font-medium text-gray-800 leading-relaxed'>
                    {typeof customer.address === 'string' 
                      ? customer.address 
                      : customer.address.street || 'Address not specified'
                    }
                  </Text>
                </div>
              </div>
            )}
            
            {/* Credit Limit */}
            {customer.creditLimit && customer.creditLimit > 0 && (
              <div className='flex items-center space-x-3 p-3 bg-orange-50 rounded-xl border border-orange-200'>
                <div className='w-3 h-3 rounded-full bg-orange-500'></div>
                <Text className='text-base font-medium text-gray-800'>
                  Credit Limit: {customer.creditLimit.toLocaleString()} PKR
                </Text>
              </div>
            )}
            
            {/* Created Date */}
            {customer.createdAt && (
              <div className='flex items-center space-x-3 p-3 bg-purple-50 rounded-xl border border-purple-200'>
                <div className='w-3 h-3 rounded-full bg-purple-500'></div>
                <Text className='text-sm font-medium text-gray-700'>
                  Created: {formatDate(customer.createdAt)}
                </Text>
              </div>
            )}
          </div>
          
          {/* Payment Status Display - Prominent Section */}
          <div className='mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-md'>
            {/* Due Amount - Most Important */}
            {dueAmount > 0 ? (
              <div className='text-center mb-3'>
                <div className='flex items-center justify-center space-x-2 mb-2'>
                  <div className='w-3 h-3 rounded-full bg-red-500 animate-pulse'></div>
                  <Text className='text-base font-bold text-red-600'>AMOUNT DUE</Text>
                </div>
                <div className='flex items-center justify-center space-x-2 mb-2'>
                  <Text className='text-3xl font-black text-red-600'>{dueAmount.toLocaleString()}</Text>
                  <Text className='text-lg text-red-500 font-bold'>PKR</Text>
                </div>
                <div className='text-center space-y-1'>
                  <Text className='block text-sm font-semibold text-red-700'>
                    Customer needs to pay
                  </Text>
                  <Text className='block text-sm font-bold text-red-600' dir='rtl'>
                    پیسے لینے ہیں
                  </Text>
                  {outstandingOrdersCount > 0 && (
                    <Text className='block text-xs text-gray-600'>
                      {outstandingOrdersCount} order(s) pending
                    </Text>
                  )}
                </div>
              </div>
            ) : customer.balance && customer.balance > 0 ? (
              <div className='text-center mb-3'>
                <div className='flex items-center justify-center space-x-2 mb-2'>
                  <div className='w-3 h-3 rounded-full bg-green-500'></div>
                  <Text className='text-base font-bold text-green-600'>ADVANCE BALANCE</Text>
                </div>
                <div className='flex items-center justify-center space-x-2 mb-2'>
                  <Text className='text-2xl font-black text-green-600'>{customer.balance.toLocaleString()}</Text>
                  <Text className='text-base text-green-500 font-bold'>PKR</Text>
                </div>
                <div className='text-center space-y-1'>
                  <Text className='block text-sm font-semibold text-green-700'>
                    Available for orders
                  </Text>
                  <Text className='block text-sm font-bold text-green-600' dir='rtl'>
                    آپ اس کے قرضدار ہیں
                  </Text>
                </div>
              </div>
            ) : (
              <div className='text-center mb-3'>
                <div className='flex items-center justify-center space-x-2 mb-2'>
                  <div className='w-3 h-3 rounded-full bg-gray-500'></div>
                  <Text className='text-base font-bold text-gray-600'>BALANCED</Text>
                </div>

                <div className='text-center'>
                  <Text className='block text-sm font-semibold text-gray-700'>
                    No outstanding amount
                  </Text>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons - Mobile Optimized */}
        <div 
          className='flex gap-3 p-3 bg-gray-50 border-t border-gray-200 -mx-4 -mb-4'
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            type='text'
            icon={<EditOutlined />}
            onClick={handleEdit}
            size='large'
            className='flex-1 h-12 font-semibold text-base text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-200'
          >
            Edit
          </Button>
          <Popconfirm
            title='Delete Customer'
            description='Are you sure you want to delete this customer?'
            onConfirm={handleDelete}
            okText='Yes'
            cancelText='No'
            okType='danger'
          >
            <Button
              type='text'
              icon={<DeleteOutlined />}
              size='large'
              danger
              className='flex-1 h-12 font-semibold text-base text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl border-2 border-red-200 hover:border-red-300 transition-all duration-200'
              loading={isDeleting}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        title='Edit Customer'
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width='95%'
        centered
        className='mobile-optimized-modal'
      >
        <Form
          form={editForm}
          onFinish={handleUpdate}
          layout='vertical'
          className='space-y-4'
        >
          <Form.Item
            name='firstName'
            label='First Name'
            rules={[{ required: true, message: 'First name is required' }]}
          >
            <Input placeholder='Enter first name' size='large' className='h-12 text-base rounded-xl' />
          </Form.Item>
          
          <Form.Item
            name='lastName'
            label='Last Name'
            rules={[{ required: true, message: 'Last name is required' }]}
          >
            <Input placeholder='Enter last name' size='large' className='h-12 text-base rounded-xl' />
          </Form.Item>
          
          <Form.Item
            name='phone'
            label='Phone Number'
            rules={[
              { required: true, message: 'Phone number is required' },
              { pattern: /^[0-9]{11}$/, message: 'Invalid phone number (11 digits required)' }
            ]}
          >
            <Input placeholder='03086173320' size='large' className='h-12 text-base rounded-xl' prefix={<PhoneOutlined />} />
          </Form.Item>
          
          <Form.Item
            name='email'
            label='Email'
            rules={[{ type: 'email', message: 'Invalid email format' }]}
          >
            <Input placeholder='Enter email address' size='large' className='h-12 text-base rounded-xl' prefix={<MailOutlined />} />
          </Form.Item>
          
          <Form.Item
            name='address'
            label='Address'
            rules={[{ required: true, message: 'Address is required' }]}
          >
            <Input placeholder='Enter address' size='large' className='h-12 text-base rounded-xl' prefix={<EnvironmentOutlined />} />
          </Form.Item>
          
          <Form.Item
            name='creditLimit'
            label='Credit Limit'
            rules={[{ type: 'number', min: 0, message: 'Credit limit must be positive' }]}
          >
            <Input 
              type='number' 
              placeholder='Enter credit limit' 
              size='large' 
              className='h-12 text-base rounded-xl' 
              prefix={<DollarOutlined />}
            />
          </Form.Item>
          
          <div className='flex gap-3 mt-6'>
            <Button 
              onClick={() => setIsEditModalOpen(false)} 
              size='large'
              className='flex-1 h-12 text-base font-semibold rounded-xl border-2 border-gray-300'
            >
              Cancel
            </Button>
            <Button 
              type='primary' 
              htmlType='submit'
              disabled={isUpdating}
              size='large'
              className='flex-1 h-12 text-base font-semibold bg-primary hover:bg-primaryDark rounded-xl shadow-md'
            >
              {isUpdating ? 'Updating...' : 'Update Customer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default CustomerCard;
