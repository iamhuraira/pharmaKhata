// components/CustomerManagement.tsx
'use client';
import { useState } from 'react';
import { Button, Input, Modal, Card, Typography, Switch, Select, DatePicker, Avatar, Table } from 'antd';
import { UserAddOutlined, SearchOutlined, PhoneOutlined, EnvironmentOutlined, MailOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import { Eye } from 'lucide-react';
// import clsx from 'clsx'; // Not used in this file
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
// import { useRouter } from 'next/navigation'; // Not used in this file

import CustomerQuickView from './CustomerQuickView';
import CustomerPaymentModal from './CustomerPaymentModal';
import { useCreateCustomer, useGetAllCustomers, useRecordPayment } from '@/hooks/customer';
import { useGetOrders } from '@/hooks/order';

const { Title, Text } = Typography;

const customerSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{11}$/, 'Invalid phone number (11 digits required)'),
  email: Yup.string().email('Invalid email format').optional(),
  address: Yup.object().shape({
    street: Yup.string().required('Street is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    country: Yup.string().required('Country is required'),
  }),
  hasAdvance: Yup.boolean(),
  advance: Yup.object().when('hasAdvance', ([hasAdvance]) => {
    if (hasAdvance) {
      return Yup.object().shape({
        amount: Yup.number().required('Amount is required').positive('Amount must be positive'),
        method: Yup.string().required('Method is required'),
        reference: Yup.string().required('Reference is required'),
        date: Yup.string().required('Date is required'),
        note: Yup.string().optional(),
      });
    }
    return Yup.object().optional();
  }),
  hasDebt: Yup.boolean(),
  debt: Yup.object().when('hasDebt', ([hasDebt]) => {
    if (hasDebt) {
      return Yup.object().shape({
        amount: Yup.number().required('Amount is required').positive('Amount must be positive'),
        method: Yup.string().required('Method is required'),
        reference: Yup.string().required('Reference is required'),
        date: Yup.string().required('Date is required'),
        note: Yup.string().optional(),
      });
    }
    return Yup.object().optional();
  }),
});

const CustomerManagement = () => {
  // const router = useRouter(); // Not used in this file

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode] = useState<'list'>('list');
  const [quickViewCustomer, setQuickViewCustomer] = useState<any>(null);
  const [isQuickViewVisible, setIsQuickViewVisible] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  const { createCustomer, isLoading } = useCreateCustomer();
  const { customers, isLoading: isLoadingCustomers, pagination } = useGetAllCustomers({
    page: currentPage,
    limit: pageSize,
    q: searchQuery
  });
  const { orders: allOrders } = useGetOrders();
  const { recordPayment, isLoading: isRecordingPayment } = useRecordPayment();
  // const { deleteCustomer } = useDeleteCustomer(); // Not used in this file

  



  const openQuickView = (customer: any) => {
    setQuickViewCustomer(customer);
    setIsQuickViewVisible(true);
  };

  const closeQuickView = () => {
    setIsQuickViewVisible(false);
    setQuickViewCustomer(null);
  };

  // const goToDetails = (customerId: string) => {
  //   router.push(`/dashboard/customer-management/${customerId}`);
  // };

  const handleAddPayment = (customer: any) => {
    setSelectedCustomerForPayment(customer);
    setIsPaymentModalOpen(true);
  };

  // const handleDelete = async (customerId: string) => {
  //   try {
  //     await deleteCustomer(customerId);
  //     console.log('🔍 Customer deactivated successfully:', customerId);
  //   } catch (error) {
  //     console.error('Error deactivating customer:', error);
  //   }
  // };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const initialValues = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Pakistan'
    },
    hasAdvance: false,
    advance: {
      amount: 0,
      method: 'cash' as const,
      reference: '',
      date: dayjs().format('YYYY-MM-DDTHH:mm:ssZ'),
      note: '',
    },
    hasDebt: false,
    debt: {
      amount: 0,
      method: 'on_account' as const,
      reference: '',
      date: dayjs().format('YYYY-MM-DDTHH:mm:ssZ'),
      note: '',
    },
  };

  const handleSubmit = async (values: typeof initialValues) => {
    console.log('🔍 handleSubmit called with values:', values);
    
    const customerData = {
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      email: values.email,
      address: values.address,
      advance: values.hasAdvance ? values.advance : undefined,
      debt: values.hasDebt ? values.debt : undefined,
    };
    
    console.log('🔍 Frontend - Form values:', values);
    console.log('🔍 Frontend - Customer data being sent:', customerData);
    console.log('🔍 Frontend - Address data:', values.address);
    console.log('🔍 Frontend - Advance data:', values.advance);
    console.log('🔍 Frontend - Has advance:', values.hasAdvance);
    
    try {
      await createCustomer(customerData);
      console.log('🔍 Customer created successfully');
      setIsModalOpen(false);
    } catch (error) {
      console.error('🔍 Error creating customer:', error);
    }
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer: any) =>
    customer.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  // Debug logging
  console.log('🔍 CustomerManagement render - viewMode:', viewMode, 'customers:', customers?.length, 'filtered:', filteredCustomers?.length);
  console.log('🔍 First customer:', filteredCustomers[0]);
  console.log('🔍 First customer keys:', filteredCustomers[0] ? Object.keys(filteredCustomers[0]) : 'No customers');


  return (
    <div className='px-4 max-w-7xl mx-auto'>
      {/* Header */}

      {/* Search and Add Customer Section */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-between mb-4">
        {/* Search Bar */}
        <div className='flex-1 max-w-md lg:max-w-lg'>
          <Input
            placeholder='Search customers by name or phone...'
            prefix={<SearchOutlined className='text-base text-gray-400' />}
            value={searchQuery}
            onChange={handleSearchChange}
            size='large'
            className='rounded-xl h-12 text-base shadow-sm border border-gray-200 focus:border-primary w-full'
          />
        </div>



        {/* Add Customer Button */}
        <div className='lg:w-auto'>
          <Button
            type='primary'
            size='large'
            icon={<UserAddOutlined className='text-lg' />}
            onClick={() => setIsModalOpen(true)}
            className='w-full lg:w-auto rounded-xl h-12 lg:h-12 bg-primary hover:bg-primaryDark text-lg font-bold shadow-md hover:shadow-lg transition-all duration-200 px-8'
          >
            Add New Customer
          </Button>
        </div>
      </div>

      {/* Customer List - Table View Only */}
      <div className='space-y-4 lg:space-y-0'>
        {isLoadingCustomers ? (
          // Loading skeleton for table
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          // Empty state
          <Card className='text-center py-16 border-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md'>
            <div className='inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6'>
              <UserAddOutlined className="text-gray-400 text-4xl" />
            </div>
            <Title level={3} className='!mb-3 text-gray-600 !text-2xl'>No customers found</Title>
            <Text type='secondary' className="text-lg text-gray-500 max-w-md mx-auto">
              {searchQuery ? 'Try adjusting your search terms' : 'Start by adding your first customer to build your database'}
            </Text>
          </Card>
        ) : (
          // Customer table with Ant Design Table component
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm" data-testid="customers-table">
            <Table
              dataSource={filteredCustomers}
              columns={[
                {
                  title: 'Customer',
                  key: 'customer',
                  width: '30%',
                  render: (customer: any) => (
                    <div className="flex items-center space-x-3 py-2">
                      <Avatar 
                        size={40} 
                        icon={<UserOutlined />} 
                        className="bg-gradient-to-br from-primary to-blue-600"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Outstanding Orders',
                  key: 'outstandingOrders',
                  width: '25%',
                  render: (customer: any) => {
                    const customerOrders = allOrders.filter((order: any) => {
                      let orderCustomerId = order.customer?.id || order.customer?._id;
                      if (typeof orderCustomerId === 'object' && orderCustomerId !== null) {
                        orderCustomerId = orderCustomerId.id || orderCustomerId._id;
                      }
                      return orderCustomerId === customer.id;
                    });
                    
                    const outstandingOrders = customerOrders.filter((order: any) => 
                      order.status === 'created' || order.status === 'partial'
                    );
                    
                    return (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {outstandingOrders.length}
                        </div>
                      </div>
                    );
                  },
                },
                {
                  title: 'Balance',
                  key: 'balance',
                  width: '25%',
                  render: (customer: any) => {
                    const balance = customer.balance || 0;
                    const isPositive = balance > 0;
                    const isNegative = balance < 0;
                    
                    return (
                      <div className="text-center">
                        <div className={`text-lg font-bold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
                          {isPositive ? '+' : ''}{balance.toLocaleString()} PKR
                        </div>
                       
                      </div>
                    );
                  },
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  width: '20%',
                  render: (customer: any) => (
                    <div className="flex justify-center items-center gap-3 space-x-2">
                      <Button
                        type="text"
                        size="small"
                        icon={<Eye className="w-6 h-6" />}
                        onClick={() => openQuickView(customer)}
                        className="text-gray-600 hover:text-gray-800"
                      />
                      <DollarOutlined 
                        onClick={() => handleAddPayment(customer)}
                        style={{ fontSize: '20px' }}
                        className="text-green-600 hover:text-green-800 cursor-pointer transition-colors duration-200"
                      />
                    </div>
                  ),
                },
              ]}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: pagination?.totalCustomers || 0,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} customers`,
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                },
                onShowSizeChange: (_current, size) => {
                  setCurrentPage(1);
                  setPageSize(size);
                },
                pageSizeOptions: ['5','10', '20', '50', '100'],
                position: ['bottomCenter'],
                className: 'customer-pagination'
              }}
              rowKey="id"
              className="customer-table"
            />
          </div>
        )}
      </div>

      {/* Customer Quick View Modal */}
      <CustomerQuickView
        visible={isQuickViewVisible}
        customer={quickViewCustomer}
        onClose={closeQuickView}
        dueAmount={quickViewCustomer?.balance || 0}
        outstandingOrdersCount={0}
      />

      {/* Payment Modal */}
      {selectedCustomerForPayment && (
        <CustomerPaymentModal
          visible={isPaymentModalOpen}
          onCancel={() => {
            setIsPaymentModalOpen(false);
            setSelectedCustomerForPayment(null);
          }}
          onSubmit={async (paymentData) => {
            try {
              await recordPayment(paymentData);
              setIsPaymentModalOpen(false);
              setSelectedCustomerForPayment(null);
              // The hook will automatically refresh the data
            } catch (error) {
              console.error('Payment failed:', error);
              // Error is handled by the hook
            }
          }}
          customerId={selectedCustomerForPayment.id}
          customerName={`${selectedCustomerForPayment.firstName} ${selectedCustomerForPayment.lastName}`}
          dueAmount={0} // For now, set to 0 since we're adding advance payment
          loading={isRecordingPayment}
        />
      )}

      {/* Create Customer Modal */}
      <Modal
        title={
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">Create New Customer</div>
            <div className="text-sm text-blue-100">Add customer details and optional advance payment</div>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
        centered
        className='customer-create-modal'
        closeIcon={
          <div className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 group">
            <svg 
              className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </div>
        }
        styles={{
          body: { 
            padding: '24px'
          },
          header: { 
            borderBottom: '1px solid #e5e7eb',
            padding: '20px 24px'
          }
        }}
        destroyOnClose
      >
        <Formik
          initialValues={initialValues}
          validationSchema={customerSchema}
          onSubmit={handleSubmit}
          enableReinitialize={false}
        >
          {({ isValid, values, submitForm, errors, touched }) => {
            console.log('🔍 Formik render - isValid:', isValid, 'errors:', errors, 'touched:', touched);
            return (
              <Form>
                <div className='h-full flex flex-col'>
                  <div className='cm-scroll flex-1 pr-1 space-y-6' style={{ maxHeight: '70vh' }}>
                  {/* Basic Information Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                      <UserOutlined className="mr-2" />
                      Basic Information
                    </h3>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium mb-2 text-gray-700'>First Name *</label>
                        <Field 
                          name='firstName' 
                          as={Input} 
                          placeholder='Enter first name' 
                          size='large' 
                          className='h-11 text-base rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500' 
                        />
                        <ErrorMessage
                          name='firstName'
                          component='div'
                          className='mt-1 text-xs text-red-500'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium mb-2 text-gray-700'>Last Name *</label>
                        <Field 
                          name='lastName' 
                          as={Input} 
                          placeholder='Enter last name' 
                          size='large' 
                          className='h-11 text-base rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500' 
                        />
                        <ErrorMessage
                          name='lastName'
                          component='div'
                          className='mt-1 text-xs text-red-500'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                    <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                      <PhoneOutlined className="mr-2" />
                      Contact Information
                    </h3>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium mb-2 text-gray-700'>Phone Number *</label>
                        <Field 
                          name='phone' 
                          as={Input} 
                          placeholder='03086173320' 
                          size='large'
                          className='h-11 text-base rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500'
                          prefix={<PhoneOutlined className='text-gray-400' />}
                        />
                        <ErrorMessage
                          name='phone'
                          component='div'
                          className='mt-1 text-xs text-red-500'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium mb-2 text-gray-700'>Email</label>
                        <Field 
                          name='email' 
                          as={Input} 
                          placeholder='Enter email address' 
                          size='large'
                          className='h-11 text-base rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500'
                          prefix={<MailOutlined className='text-gray-400' />}
                        />
                        <ErrorMessage
                          name='email'
                          component='div'
                          className='mt-1 text-xs text-red-500'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
                    <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                      <EnvironmentOutlined className="mr-2" />
                      Address Information
                    </h3>
                    <div className='space-y-3'>
                      <Field 
                        name='address.street' 
                        as={Input} 
                        placeholder='Enter street address' 
                        size='large'
                        className='h-11 text-base rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500'
                        prefix={<EnvironmentOutlined className='text-gray-400' />}
                      />
                      <ErrorMessage
                        name='address.street'
                        component='div'
                        className='mt-1 text-xs text-red-500'
                      />
                      
                      <div className='grid grid-cols-2 gap-3'>
                        <Field 
                          name='address.city' 
                          as={Input} 
                          placeholder='City' 
                          size='large'
                          className='h-11 text-base rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500'
                        />
                        <Field 
                          name='address.state' 
                          as={Input} 
                          placeholder='State/Province' 
                          size='large'
                          className='h-11 text-base rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500'
                        />
                      </div>
                      <div className='grid grid-cols-2 gap-3'>
                        <ErrorMessage
                          name='address.city'
                          component='div'
                          className='mt-1 text-xs text-red-500'
                        />
                        <ErrorMessage
                          name='address.state'
                          component='div'
                          className='mt-1 text-xs text-red-500'
                        />
                      </div>
                      
                      <Field 
                        name='address.country' 
                        as={Input} 
                        placeholder='Country' 
                        size='large'
                        className='h-11 text-base rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500'
                        defaultValue='Pakistan'
                      />
                      <ErrorMessage
                        name='address.country'
                        component='div'
                        className='mt-1 text-xs text-red-500'
                      />
                    </div>
                  </div>

                  {/* Advance Payment Section */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100">
                    <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                      <DollarOutlined className="mr-2" />
                      Advance Payment
                    </h3>
                    <div className='flex items-center space-x-3 mb-4'>
                      <Field name='hasAdvance'>
                        {({ field, form }: any) => (
                          <Switch
                            checked={field.value}
                            onChange={(checked) => form.setFieldValue('hasAdvance', checked)}
                            className='bg-orange-500'
                          />
                        )}
                      </Field>
                      <span className='text-gray-600 text-sm'>Customer wants to pay advance</span>
                    </div>

                    <Field name='hasAdvance'>
                      {({ field }: any) => field.value && (
                        <div className='space-y-3 p-4 bg-white rounded-lg border border-orange-200'>
                          <div className='grid grid-cols-2 gap-3'>
                            <div>
                              <label className='block text-sm font-medium mb-2 text-gray-700'>Amount *</label>
                              <Field 
                                name='advance.amount' 
                                as={Input} 
                                type='number'
                                placeholder='Enter amount' 
                                size='large'
                                className='h-11 text-base rounded-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500'
                                prefix={<DollarOutlined className='text-gray-400' />}
                              />
                            </div>
                            <div>
                              <label className='block text-sm font-medium mb-2 text-gray-700'>Method *</label>
                              <Field name='advance.method'>
                                {({ field, form }: any) => (
                                  <Select
                                    value={field.value}
                                    onChange={(value) => form.setFieldValue('advance.method', value)}
                                    placeholder='Select method'
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
                          </div>
                          
                          <div className='grid grid-cols-2 gap-3'>
                            <div>
                              <label className='block text-sm font-medium mb-2 text-gray-700'>Reference</label>
                              <Field 
                                name='advance.reference' 
                                as={Input} 
                                placeholder='Payment reference' 
                                size='large'
                                className='h-11 text-base rounded-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500'
                              />
                            </div>
                            <div>
                              <label className='block text-sm font-medium mb-2 text-gray-700'>Date</label>
                              <Field name='advance.date'>
                                {({ field, form }: any) => (
                                  <DatePicker
                                    value={field.value ? dayjs(field.value) : null}
                                    onChange={(date) => form.setFieldValue('advance.date', date ? date.format('YYYY-MM-DDTHH:mm:ssZ') : '')}
                                    size='large'
                                    className='w-full'
                                    format='YYYY-MM-DD'
                                  />
                                )}
                              </Field>
                            </div>
                          </div>
                          
                          <div>
                            <label className='block text-sm font-medium mb-2 text-gray-700'>Note</label>
                            <Field 
                              name='advance.note' 
                              as={Input.TextArea} 
                              placeholder='Additional notes' 
                              rows={2}
                              className='rounded-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500'
                            />
                          </div>
                        </div>
                      )}
                    </Field>
                  </div>

                  {/* Debt Section */}
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-100">
                    <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                      <DollarOutlined className="mr-2" />
                      Initial Debt
                    </h3>
                    <div className='flex items-center space-x-3 mb-4'>
                      <Field name='hasDebt'>
                        {({ field, form }: any) => (
                          <Switch
                            checked={field.value}
                            onChange={(checked) => form.setFieldValue('hasDebt', checked)}
                            className='bg-red-500'
                          />
                        )}
                      </Field>
                      <span className='text-gray-600 text-sm'>Customer has existing debt</span>
                    </div>

                    <Field name='hasDebt'>
                      {({ field }: any) => field.value && (
                        <div className='space-y-3 p-4 bg-white rounded-lg border border-red-200'>
                          <div className='grid grid-cols-2 gap-3'>
                            <div>
                              <label className='block text-sm font-medium mb-2 text-gray-700'>Amount *</label>
                              <Field 
                                name='debt.amount' 
                                as={Input} 
                                type='number'
                                placeholder='Enter debt amount' 
                                size='large'
                                className='h-11 text-base rounded-lg border-gray-200 focus:border-red-500 focus:ring-red-500'
                                prefix={<DollarOutlined className='text-gray-400' />}
                              />
                            </div>
                            <div>
                              <label className='block text-sm font-medium mb-2 text-gray-700'>Method *</label>
                              <Field name='debt.method'>
                                {({ field, form }: any) => (
                                  <Select
                                    value={field.value}
                                    onChange={(value) => form.setFieldValue('debt.method', value)}
                                    placeholder='Select method'
                                    size='large'
                                    className='w-full'
                                    options={[
                                      { value: 'on_account', label: 'On Account' },
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
                          </div>
                          
                          <div className='grid grid-cols-2 gap-3'>
                            <div>
                              <label className='block text-sm font-medium mb-2 text-gray-700'>Reference</label>
                              <Field 
                                name='debt.reference' 
                                as={Input} 
                                placeholder='Debt reference' 
                                size='large'
                                className='h-11 text-base rounded-lg border-gray-200 focus:border-red-500 focus:ring-red-500'
                              />
                            </div>
                            <div>
                              <label className='block text-sm font-medium mb-2 text-gray-700'>Date</label>
                              <Field name='debt.date'>
                                {({ field, form }: any) => (
                                  <DatePicker
                                    value={field.value ? dayjs(field.value) : null}
                                    onChange={(date) => form.setFieldValue('debt.date', date ? date.format('YYYY-MM-DDTHH:mm:ssZ') : '')}
                                    size='large'
                                    className='w-full'
                                    format='YYYY-MM-DD'
                                  />
                                )}
                              </Field>
                            </div>
                          </div>
                          
                          <div>
                            <label className='block text-sm font-medium mb-2 text-gray-700'>Note</label>
                            <Field 
                              name='debt.note' 
                              as={Input.TextArea} 
                              placeholder='Additional notes about the debt' 
                              rows={2}
                              className='rounded-lg border-gray-200 focus:border-red-500 focus:ring-red-500'
                            />
                          </div>
                        </div>
                      )}
                    </Field>
                  </div>
                </div>

                <div className='flex items-center justify-end gap-3 pt-4 border-t border-gray-200 mt-6'>
                  <Button 
                    onClick={() => setIsModalOpen(false)}
                    size='large'
                    className='h-11 px-6 rounded-lg border-gray-300 text-gray-700 hover:border-gray-400'
                  >
                    Cancel
                  </Button>
                  <Button 
                    type='primary' 
                    size='large'
                    loading={isLoading}
                    disabled={!isValid}
                    onClick={() => {
                      console.log('🔍 Submit button clicked');
                      console.log('🔍 Form isValid:', isValid);
                      console.log('🔍 Form values:', values);
                      submitForm();
                    }}
                    className='h-11 px-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200'
                  >
                    {isLoading ? 'Creating...' : 'Create Customer'}
                  </Button>
                </div>
              </div>
            </Form>
          );
        }}
        </Formik>
      </Modal>
    </div>
  );
};

export default CustomerManagement;
