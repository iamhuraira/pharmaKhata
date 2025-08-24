// components/CustomerManagement.tsx
'use client';
import { useState, useEffect } from 'react';
import { Button, Input, Modal, Card, Typography, Divider, Switch, Select, DatePicker, Table, Avatar, Tag } from 'antd';
import { UserAddOutlined, SearchOutlined, PhoneOutlined, EnvironmentOutlined, MailOutlined, DollarOutlined, AppstoreOutlined, UnorderedListOutlined, UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const { createCustomer, isLoading } = useCreateCustomer();
  const { customers, isLoading: isLoadingCustomers } = useGetAllCustomers();
  const { orders: allOrders } = useGetOrders();

  // Table columns for list view
  const tableColumns = [
    {
      title: 'Customer',
      key: 'customer',
      render: (customer: any) => {
        console.log('🔍 Rendering Customer column for:', customer);
        if (!customer || typeof customer !== 'object') {
          console.warn('🔍 Invalid customer data in Customer column:', customer);
          return <div>Invalid data</div>;
        }
        
        // Handle case where fields might be objects
        const firstName = typeof customer.firstName === 'string' ? customer.firstName : 'N/A';
        const lastName = typeof customer.lastName === 'string' ? customer.lastName : '';
        const phone = typeof customer.phone === 'string' ? customer.phone : 'No phone';
        
        return (
          <div className="flex items-center space-x-3">
            <Avatar 
              size={40} 
              icon={<UserOutlined />} 
              className="bg-gradient-to-br from-primary to-blue-600"
            />
            <div>
              <div className="font-semibold text-gray-900">
                {firstName} {lastName}
              </div>
              <div className="text-sm text-gray-500">{phone}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Address',
      key: 'address',
      render: (customer: any) => {
        console.log('🔍 Rendering Address column for:', customer);
        if (!customer || typeof customer !== 'object') {
          console.warn('🔍 Invalid customer data in Address column:', customer);
          return <div>Invalid data</div>;
        }
        
        // Handle case where address might be an empty object
        let addressText = 'No address';
        if (customer.address) {
          if (typeof customer.address === 'string' && customer.address.trim() !== '') {
            addressText = customer.address;
          } else if (typeof customer.address === 'object' && customer.address !== null) {
            console.warn('🔍 Address is an object, not a string:', customer.address);
            addressText = 'Invalid address format';
          }
        }
        
        return (
          <div className="max-w-xs">
            <div className="text-sm text-gray-900">{addressText}</div>
            {customer.email && typeof customer.email === 'string' && customer.email.trim() !== '' && (
              <div className="text-sm text-gray-500">{customer.email}</div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Orders',
      key: 'orders',
      render: (customer: any) => {
        console.log('🔍 Rendering Orders column for:', customer);
        if (!customer || typeof customer !== 'object') {
          console.warn('🔍 Invalid customer data in Orders column:', customer);
          return <div>Invalid data</div>;
        }
        try {
          const result = calculateCustomerDueAmount(customer.id || customer._id);
          console.log('🔍 Orders calculation result:', result);
          const { outstandingOrdersCount } = result;
          return (
            <div className="text-center">
              <div className="font-semibold text-gray-900">{outstandingOrdersCount || 0}</div>
              <div className="text-sm text-gray-500">outstanding</div>
            </div>
          );
        } catch (error) {
          console.error('Error calculating orders for customer:', customer, error);
          return (
            <div className="text-center">
              <div className="font-semibold text-gray-900">0</div>
              <div className="text-sm text-gray-500">outstanding</div>
            </div>
          );
        }
      },
    },
    {
      title: 'Due Amount',
      key: 'dueAmount',
      render: (customer: any) => {
        console.log('🔍 Rendering Due Amount column for:', customer);
        if (!customer || typeof customer !== 'object') {
          console.warn('🔍 Invalid customer data in Due Amount column:', customer);
          return <div>Invalid data</div>;
        }
        try {
          const result = calculateCustomerDueAmount(customer.id || customer._id);
          console.log('🔍 Due amount calculation result:', result);
          const { dueAmount } = result;
          return (
            <div className={`text-right ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              <div className="font-semibold">
                {dueAmount > 0 ? dueAmount.toLocaleString() : '0.00'} PKR
              </div>
              <div className="text-sm">
                {dueAmount > 0 ? 'Outstanding' : 'Paid'}</div>
            </div>
          );
        } catch (error) {
          console.error('Error calculating due amount for customer:', customer, error);
          return (
            <div className="text-right text-green-600">
              <div className="font-semibold">0.00 PKR</div>
              <div className="text-sm">Paid</div>
            </div>
          );
        }
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (customer: any) => {
        console.log('🔍 Rendering Status column for:', customer);
        if (!customer || typeof customer !== 'object') {
          console.warn('🔍 Invalid customer data in Status column:', customer);
          return <div>Invalid data</div>;
        }
        
        // Handle case where status might be an object
        const status = typeof customer.status === 'string' ? customer.status : 'active';
        
        return (
          <Tag color={status === 'active' ? 'success' : 'default'}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (customer: any) => {
        console.log('🔍 Rendering Actions column for:', customer);
        if (!customer || typeof customer !== 'object') {
          console.warn('🔍 Invalid customer data in Actions column:', customer);
          return <div>Invalid data</div>;
        }
        return (
          <div className="flex space-x-2">
            <Button 
              size="small" 
              icon={<EditOutlined />}
              className="text-blue-600 border-blue-300 hover:text-blue-700 hover:border-blue-400"
            >
              Edit
            </Button>
            <Button 
              size="small" 
              danger
              icon={<DeleteOutlined />}
              className="border-red-300 hover:border-red-400"
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  // Handle view mode persistence
  useEffect(() => {
    if (!searchParams) return;
    
    const urlView = searchParams.get('view') as 'card' | 'list' | null;
    const localStorageView = localStorage.getItem('customers:view') as 'card' | 'list' | null;
    
    const newView = urlView || localStorageView || 'card';
    setViewMode(newView);
    
    // Update localStorage if it's different
    if (localStorageView !== newView) {
      localStorage.setItem('customers:view', newView);
    }
    
    // Update URL if it's different and no view param exists
    if (!urlView && newView !== 'card') {
      const params = new URLSearchParams(searchParams.toString());
      params.set('view', newView);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);

  const handleViewToggle = (newView: 'card' | 'list') => {
    setViewMode(newView);
    localStorage.setItem('customers:view', newView);
    
    if (!searchParams) return;
    
    const params = new URLSearchParams(searchParams.toString());
    if (newView === 'card') {
      params.delete('view');
    } else {
      params.set('view', newView);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

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
    try {
      console.log(`🔍 Looking for orders for customer ID: ${customerId}`);
      console.log(`🔍 All orders:`, allOrders);
      console.log(`🔍 Customer ID type:`, typeof customerId, 'Value:', customerId);
      
      if (!customerId) {
        console.warn('🔍 No customer ID provided, returning default values');
        return { dueAmount: 0, outstandingOrdersCount: 0 };
      }
      
      // Try different ways to match customer
      const customerOrders = allOrders.filter((order: any) => {
        // Handle both customer.id (string) and customer._id (string) cases
        let orderCustomerId = order.customer?.id || order.customer?._id;
        
        // If customer is a full object, try to get the ID from it
        if (typeof orderCustomerId === 'object' && orderCustomerId !== null) {
          orderCustomerId = orderCustomerId.id || orderCustomerId._id;
        }
        
        const matches = orderCustomerId === customerId;
        console.log(`🔍 Order customer:`, order.customer);
        console.log(`🔍 Order customer ID: ${orderCustomerId}, customer ID: ${customerId}, matches: ${matches}`);
        return matches;
      });
      
      const outstandingOrders = customerOrders.filter((order: any) => 
        order.status === 'created' || order.status === 'partial'
      );
      
      // Debug logging
      console.log(`🔍 Customer ${customerId} orders:`, customerOrders);
      console.log(`🔍 Outstanding orders:`, outstandingOrders);
      
      const totalOutstandingAmount = outstandingOrders.reduce((sum: number, order: any) => {
        const balance = order.totals?.balance || order.balance || 0;
        console.log(`🔍 Order ${order.orderId || order.id} balance:`, balance);
        return sum + balance;
      }, 0);
      
      console.log(`🔍 Total outstanding amount for customer ${customerId}:`, totalOutstandingAmount);
      
      const result = {
        dueAmount: totalOutstandingAmount || 0,
        outstandingOrdersCount: outstandingOrders.length || 0
      };
      
      console.log(`🔍 Returning result:`, result);
      return result;
    } catch (error) {
      console.error('🔍 Error in calculateCustomerDueAmount:', error);
      return { dueAmount: 0, outstandingOrdersCount: 0 };
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
  console.log('🔍 tableColumns:', tableColumns);

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
            onChange={(e) => setSearchQuery(e.target.value)}
            size='large'
            className='rounded-xl h-12 text-base shadow-sm border border-gray-200 focus:border-primary w-full'
          />
        </div>

        {/* View Toggle */}
        <div className="inline-flex rounded-xl border border-neutral-200 bg-white p-1 shadow-sm">
          <button
            data-testid="view-card"
            onClick={() => handleViewToggle('card')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              viewMode === 'card' 
                ? 'bg-neutral-900 text-white' 
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
            aria-pressed={viewMode === 'card'}
            aria-label="Card view"
          >
            <AppstoreOutlined className="mr-1" />
            Card
          </button>
          <button
            data-testid="view-list"
            onClick={() => handleViewToggle('list')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              viewMode === 'card' 
                ? 'text-neutral-700 hover:bg-neutral-100' 
                : 'bg-neutral-900 text-white'
            }`}
            aria-pressed={viewMode === 'list'}
            aria-label="List view"
          >
            <UnorderedListOutlined className="mr-1" />
            List
          </button>
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

      {/* Customer List - Card or Table View */}
      <div className='space-y-4 lg:space-y-0'>
        {isLoadingCustomers ? (
          // Loading skeletons - show appropriate skeleton based on view mode
          viewMode === 'card' ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6'>
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className='animate-pulse border-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden shadow-sm h-48'>
                  <div className='p-4'>
                    <div className='flex items-center space-x-3 mb-4'>
                      <div className='w-12 h-12 bg-gray-200 rounded-full'></div>
                      <div className='flex-1 space-y-2'>
                        <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                        <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <div className='h-3 bg-gray-200 rounded w-full'></div>
                      <div className='h-3 bg-gray-200 rounded w-2/3'></div>
                      <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
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
          )
        ) : filteredCustomers.length === 0 ? (
          // Empty state
          <Card className='text-center py-16 border-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md'>
            <div className='inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6'>
              <UserAddOutlined className='text-gray-400 text-4xl' />
            </div>
            <Title level={3} className='!mb-3 text-gray-600 !text-2xl'>No customers found</Title>
            <Text type='secondary' className='text-lg text-gray-500 max-w-md mx-auto'>
              {searchQuery ? 'Try adjusting your search terms' : 'Start by adding your first customer to build your database'}
            </Text>
          </Card>
        ) : viewMode === 'card' ? (
          // Customer cards - Responsive grid
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6'>
            {filteredCustomers.map((customer: any) => {
              console.log(`🔍 Processing customer:`, customer);
              try {
                const { dueAmount, outstandingOrdersCount } = calculateCustomerDueAmount(customer.id || customer._id);
                console.log(`🔍 Customer ${customer.firstName} ${customer.lastName} - Due: ${dueAmount}, Orders: ${outstandingOrdersCount}`);
                return (
                  <CustomerCard 
                    key={customer.id || customer._id} 
                    customer={customer} 
                    dueAmount={dueAmount}
                    outstandingOrdersCount={outstandingOrdersCount}
                  />
                );
              } catch (error) {
                console.error('Error processing customer:', customer, error);
                return (
                  <CustomerCard 
                    key={customer.id || customer._id || Math.random()} 
                    customer={customer} 
                    dueAmount={0}
                    outstandingOrdersCount={0}
                  />
                );
              }
            })}
          </div>
        ) : (
          // Customer table - List view
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <Table
              columns={tableColumns}
              dataSource={filteredCustomers.filter((customer: any) => {
                // Ensure customer is a valid object with required properties
                const isValid = customer && 
                               typeof customer === 'object' && 
                               customer !== null &&
                               (customer.id || customer._id) &&
                               typeof customer.firstName === 'string';
                
                if (!isValid) {
                  console.warn('🔍 Filtered out invalid customer:', customer);
                }
                
                return isValid;
              })}
              rowKey={(record) => {
                const key = record.id || record._id || Math.random().toString();
                console.log('🔍 Table row key:', key, 'for record:', record);
                return key;
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} customers`,
              }}
              className="customer-table"
              rowClassName="hover:bg-gray-50 transition-colors"
              size="middle"
            />
          </div>
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
