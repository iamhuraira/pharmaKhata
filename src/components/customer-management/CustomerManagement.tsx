// components/CustomerManagement.tsx
'use client';
import { useState } from 'react';
import { Button, Input, Modal, Card, Typography, Divider, Switch, Select, DatePicker } from 'antd';
import { UserAddOutlined, SearchOutlined, PhoneOutlined, EnvironmentOutlined, MailOutlined, DollarOutlined } from '@ant-design/icons';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import CustomerCard from './CustomerCard';
import { useCreateCustomer, useGetAllCustomers } from '@/hooks/customer';
import { useGetOrders } from '@/hooks/order';

const { Title, Text } = Typography;

const customerSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{11}$/, 'Invalid phone number (11 digits required)'),
  email: Yup.string().email('Invalid email format').optional(),
  address: Yup.string().required('Address is required'),
  creditLimit: Yup.number().min(0, 'Credit limit must be positive').optional(),
  hasAdvance: Yup.boolean(),
  advance: Yup.object().optional(),
});

const CustomerManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { createCustomer, isLoading } = useCreateCustomer();
  const { customers, isLoading: isLoadingCustomers } = useGetAllCustomers();
  const { orders: allOrders } = useGetOrders();

  const initialValues = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    creditLimit: 0,
    hasAdvance: false,
    advance: {
      amount: 0,
      method: 'cash' as const,
      reference: '',
      date: dayjs().format('YYYY-MM-DDTHH:mm:ssZ'),
      note: '',
    },
  };

  const handleSubmit = async (values: typeof initialValues) => {
    const customerData = {
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      email: values.email,
      address: values.address,
      creditLimit: values.creditLimit,
      advance: values.hasAdvance ? values.advance : undefined,
    };
    
    await createCustomer(customerData);
    setIsModalOpen(false);
  };

  // Calculate due amount for each customer
  const calculateCustomerDueAmount = (customerId: string) => {
    const customerOrders = allOrders.filter((order: any) => order.customer?.id === customerId);
    const outstandingOrders = customerOrders.filter((order: any) => 
      order.status === 'created' || order.status === 'partial'
    );
    const totalOutstandingAmount = outstandingOrders.reduce((sum: number, order: any) => 
      sum + (order.totals?.balance || 0), 0
    );
    return {
      dueAmount: totalOutstandingAmount,
      outstandingOrdersCount: outstandingOrders.length
    };
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer: any) =>
    customer.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  return (
    <div className='p-4'>
      {/* Header */}
      <div className='mb-6 text-center'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full mb-4 shadow-lg'>
          <UserAddOutlined className='text-white text-2xl' />
        </div>
        <Title level={2} className='!mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent !text-2xl'>
          Customers
        </Title>
        <Text type='secondary' className='text-base'>
          Manage your customer database efficiently
        </Text>
      </div>

      {/* Search Bar */}
      <div className='mb-4'>
        <Input
          placeholder='Search customers by name or phone...'
          prefix={<SearchOutlined className='text-base text-gray-400' />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size='large'
          className='rounded-xl h-12 text-base shadow-sm border border-gray-200 focus:border-primary'
        />
      </div>

      {/* Add Customer Button */}
      <div className='mb-6 text-center'>
        <Button
          type='primary'
          size='large'
          icon={<UserAddOutlined className='text-lg' />}
          onClick={() => setIsModalOpen(true)}
          className='w-full rounded-xl h-14 bg-primary hover:bg-primaryDark text-lg font-bold shadow-md hover:shadow-lg transition-all duration-200'
        >
          Add New Customer
        </Button>
      </div>

      {/* Customer List */}
      <div className='space-y-3'>
        {isLoadingCustomers ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className='animate-pulse border-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden shadow-sm'>
              <div className='p-4'>
                <div className='flex items-center space-x-3'>
                  <div className='w-14 h-14 bg-gray-200 rounded-full'></div>
                  <div className='flex-1 space-y-3'>
                    <div className='h-5 bg-gray-200 rounded w-3/4'></div>
                    <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                    <div className='h-4 bg-gray-200 rounded w-2/3'></div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : filteredCustomers.length === 0 ? (
          // Empty state
          <Card className='text-center py-12 border-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4'>
              <UserAddOutlined className='text-gray-400 text-3xl' />
            </div>
            <Title level={4} className='!mb-2 text-gray-600 !text-xl'>No customers found</Title>
            <Text type='secondary' className='text-base text-gray-500'>
              {searchQuery ? 'Try adjusting your search terms' : 'Start by adding your first customer'}
            </Text>
          </Card>
        ) : (
          // Customer cards
          filteredCustomers.map((customer: any) => {
            const { dueAmount, outstandingOrdersCount } = calculateCustomerDueAmount(customer.id);
            return (
              <CustomerCard 
                key={customer.id} 
                customer={customer} 
                dueAmount={dueAmount}
                outstandingOrdersCount={outstandingOrdersCount}
              />
            );
          })
        )}
      </div>

      {/* Create Customer Modal */}
      <Modal
        title='Create New Customer'
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width='95%'
        centered
        className='mobile-optimized-modal'
      >
        <Formik
          initialValues={initialValues}
          validationSchema={customerSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, isValid }) => (
            <Form>
              <div className='space-y-4'>
                <div>
                  <label className='block text-base font-semibold mb-2 text-gray-800'>First Name *</label>
                  <Field name='firstName' as={Input} placeholder='Enter first name' size='large' className='h-12 text-base rounded-xl' />
                  <ErrorMessage
                    name='firstName'
                    component='div'
                    className='mt-1 text-sm text-red-500 font-medium'
                  />
                </div>

                <div>
                  <label className='block text-base font-semibold mb-2 text-gray-800'>Last Name *</label>
                  <Field name='lastName' as={Input} placeholder='Enter last name' size='large' className='h-12 text-base rounded-xl' />
                  <ErrorMessage
                    name='lastName'
                    component='div'
                    className='mt-1 text-sm text-red-500 font-medium'
                  />
                </div>

                <div>
                  <label className='block text-base font-semibold mb-2 text-gray-800'>Phone Number *</label>
                  <Field 
                    name='phone' 
                    as={Input} 
                    placeholder='03086173320' 
                    size='large'
                    className='h-12 text-base rounded-xl'
                    prefix={<PhoneOutlined className='text-base' />}
                  />
                  <ErrorMessage
                    name='phone'
                    component='div'
                    className='mt-1 text-sm text-red-500 font-medium'
                  />
                </div>

                <div>
                  <label className='block text-base font-semibold mb-2 text-gray-800'>Address *</label>
                  <Field 
                    name='address' 
                    as={Input} 
                    placeholder='Enter address' 
                    size='large'
                    className='h-12 text-base rounded-xl'
                    prefix={<EnvironmentOutlined className='text-base' />}
                  />
                  <ErrorMessage
                    name='address'
                    component='div'
                    className='mt-1 text-sm text-red-500 font-medium'
                  />
                </div>

                <div>
                  <label className='block text-base font-semibold mb-2 text-gray-800'>Email</label>
                  <Field 
                    name='email' 
                    as={Input} 
                    placeholder='Enter email address' 
                    size='large'
                    className='h-12 text-base rounded-xl'
                    prefix={<MailOutlined className='text-base' />}
                  />
                  <ErrorMessage
                    name='email'
                    component='div'
                    className='mt-1 text-sm text-red-500 font-medium'
                  />
                </div>

                <div>
                  <label className='block text-base font-semibold mb-2 text-gray-800'>Credit Limit</label>
                  <Field 
                    name='creditLimit' 
                    as={Input} 
                    type='number'
                    placeholder='Enter credit limit' 
                    size='large'
                    className='h-12 text-base rounded-xl'
                    prefix={<DollarOutlined className='text-base' />}
                  />
                  <ErrorMessage
                    name='creditLimit'
                    component='div'
                    className='mt-1 text-sm text-red-500 font-medium'
                  />
                </div>

                <Divider className='my-4' />

                <div>
                  <label className='block text-base font-semibold mb-2 text-gray-800'>Advance Payment</label>
                  <div className='flex items-center space-x-3 mb-4'>
                    <Field name='hasAdvance'>
                      {({ field, form }: any) => (
                        <Switch
                          checked={field.value}
                          onChange={(checked) => form.setFieldValue('hasAdvance', checked)}
                          className='bg-primary'
                        />
                      )}
                    </Field>
                    <span className='text-gray-600'>Customer wants to pay advance</span>
                  </div>

                  <Field name='hasAdvance'>
                    {({ field }: any) => field.value && (
                      <div className='space-y-4 p-4 bg-gray-50 rounded-lg border'>
                        <div>
                          <label className='block text-sm font-medium mb-2 text-gray-700'>Advance Amount *</label>
                          <Field 
                            name='advance.amount' 
                            as={Input} 
                            type='number'
                            placeholder='Enter advance amount' 
                            size='large'
                            className='h-12 text-base rounded-xl'
                            prefix={<DollarOutlined className='text-base' />}
                          />
                        </div>

                        <div>
                          <label className='block text-sm font-medium mb-2 text-gray-700'>Payment Method *</label>
                          <Field name='advance.method'>
                            {({ field, form }: any) => (
                              <Select
                                value={field.value}
                                onChange={(value) => form.setFieldValue('advance.method', value)}
                                placeholder='Select payment method'
                                size='large'
                                className='w-full'
                                options={[
                                  { value: 'cash', label: 'Cash' },
                                  { value: 'bank', label: 'Bank Transfer' },
                                  { value: 'jazzcash', label: 'JazzCash' },
                                  { value: 'card', label: 'Card' },
                                  { value: 'other', label: 'Other' },
                                ]}
                              />
                            )}
                          </Field>
                        </div>

                        <div>
                          <label className='block text-sm font-medium mb-2 text-gray-700'>Reference *</label>
                          <Field 
                            name='advance.reference' 
                            as={Input} 
                            placeholder='Enter reference number' 
                            size='large'
                            className='h-12 text-base rounded-xl'
                          />
                        </div>

                        <div>
                          <label className='block text-sm font-medium mb-2 text-gray-700'>Date *</label>
                          <Field name='advance.date'>
                            {({ field, form }: any) => (
                              <DatePicker
                                value={field.value ? dayjs(field.value) : null}
                                onChange={(date) => form.setFieldValue('advance.date', date ? date.format('YYYY-MM-DDTHH:mm:ssZ') : '')}
                                size='large'
                                className='w-full h-12 rounded-xl'
                                format='YYYY-MM-DD HH:mm'
                                showTime={{ format: 'HH:mm' }}
                              />
                            )}
                          </Field>
                        </div>

                        <div>
                          <label className='block text-sm font-medium mb-2 text-gray-700'>Note</label>
                          <Field 
                            name='advance.note' 
                            as={Input.TextArea} 
                            placeholder='Enter note (optional)' 
                            rows={3}
                            className='rounded-xl'
                          />
                        </div>
                      </div>
                    )}
                  </Field>
                </div>

                <Divider className='my-4' />

                <div className='flex gap-3'>
                  <Button 
                    onClick={() => setIsModalOpen(false)} 
                    size='large'
                    className='flex-1 h-12 text-base font-semibold rounded-xl border-2 border-gray-300'
                  >
                    Cancel
                  </Button>
                  <Button 
                    type='primary' 
                    onClick={() => handleSubmit()} 
                    disabled={isLoading || !isValid}
                    size='large'
                    className='flex-1 h-12 text-base font-semibold bg-primary hover:bg-primaryDark rounded-xl shadow-md'
                  >
                    {isLoading ? 'Creating...' : 'Create Customer'}
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default CustomerManagement;
