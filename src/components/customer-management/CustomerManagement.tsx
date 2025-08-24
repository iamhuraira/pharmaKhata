// components/CustomerManagement.tsx
'use client';
import { useState } from 'react';
import { Button, Input, Modal, Card, Typography, Divider, Switch, Select, DatePicker, Avatar, Table } from 'antd';
import { UserAddOutlined, SearchOutlined, PhoneOutlined, EnvironmentOutlined, MailOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import { Eye } from 'lucide-react';
import clsx from 'clsx';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

import CustomerQuickView from './CustomerQuickView';
import { useCreateCustomer, useGetAllCustomers } from '@/hooks/customer';
import { useGetOrders } from '@/hooks/order';
import { useGetAllCustomerBalances } from '@/hooks/customerBalance';

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode] = useState<'list'>('list');
  const [quickViewCustomer, setQuickViewCustomer] = useState<any>(null);
  const [isQuickViewVisible, setIsQuickViewVisible] = useState(false);
  const { createCustomer, isLoading } = useCreateCustomer();
  const { customers, isLoading: isLoadingCustomers } = useGetAllCustomers();
  const { orders: allOrders } = useGetOrders();
  const { customerBalances } = useGetAllCustomerBalances();

  



  const openQuickView = (customer: any) => {
    setQuickViewCustomer(customer);
    setIsQuickViewVisible(true);
  };

  const closeQuickView = () => {
    setIsQuickViewVisible(false);
    setQuickViewCustomer(null);
  };

  const goToDetails = (customerId: string) => {
    router.push(`/dashboard/customer-management/${customerId}`);
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
              <UserAddOutlined className='text-gray-400 text-4xl' />
            </div>
            <Title level={3} className='!mb-3 text-gray-600 !text-2xl'>No customers found</Title>
            <Text type='secondary' className='text-lg text-gray-500 max-w-md mx-auto'>
              {searchQuery ? 'Try adjusting your search terms' : 'Start by adding your first customer to build your database'}
            </Text>
          </Card>
        ) : (
          // Customer table with Ant Design Table component
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm" data-testid="customers-table">
            <Table
              columns={[
                {
                  title: 'Customer',
                  key: 'customer',
                  width: '40%',
                  render: (customer: any) => (
                    <div className="flex items-center space-x-3 py-2">
                      <Avatar 
                        size={40} 
                        icon={<UserOutlined />} 
                        className="bg-gradient-to-br from-primary to-blue-600"
                      />
                      <div>
                        <div className="font-semibold text-neutral-900 text-base">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-neutral-500 mt-1">
                          {customer.phone}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Outstanding Orders',
                  key: 'orders',
                  width: '20%',
                  align: 'center' as const,
                  render: (customer: any) => {
                    let outstandingOrdersCount = 0;
                    try {
                      const result = calculateCustomerDueAmount(customer.id || customer._id);
                      outstandingOrdersCount = result.outstandingOrdersCount;
                    } catch (error) {
                      console.error('Error calculating orders for customer:', error);
                    }
                    return (
                      <div className="text-center py-2">
                        <div className="font-semibold text-neutral-800 text-lg">{outstandingOrdersCount || 0}</div>
                        <div className="text-xs text-neutral-500 mt-1">orders</div>
                      </div>
                    );
                  },
                },
                {
                  title: 'Balance',
                  key: 'balance',
                  width: '25%',
                  align: 'right' as const,
                  render: (customer: any) => {
                    // Get balance from the new balance calculation system
                    const customerId = customer.id || customer._id;
                    const customerBalance = customerBalances?.find((cb: any) => 
                      cb.customerId === customerId || cb.customerId === customer._id
                    );
                    
                    let balance = 0;
                    let balanceSource = 'unknown';
                    
                    if (customerBalance) {
                      balance = customerBalance.balance || 0;
                      balanceSource = 'ledger calculation';
                      console.log(`🔍 Customer ${customer.firstName}: Balance from ledger = ${balance}`);
                    } else {
                      // Fallback to old calculation if balance not found
                      try {
                        const result = calculateCustomerDueAmount(customerId);
                        balance = result.dueAmount;
                        balanceSource = 'fallback calculation';
                        console.log(`🔍 Customer ${customer.firstName}: Fallback balance = ${balance}`);
                      } catch (error) {
                        console.error(`Error calculating balance for customer ${customer.firstName}:`, error);
                        balance = 0;
                        balanceSource = 'error fallback';
                      }
                    }
                    
                    const isPositive = balance > 0;
                    const isZero = balance === 0;
                    const isNegative = balance < 0;
                    
                    console.log(`🔍 Final balance for ${customer.firstName}: ${balance} (${balanceSource}) - Positive:${isPositive}, Zero:${isZero}, Negative:${isNegative}`);
                    
                    return (
                      <div className="text-right py-2">
                        <div className={clsx(
                          "font-semibold text-lg",
                          isPositive ? "text-emerald-600" : 
                          isNegative ? "text-rose-600" : "text-neutral-600"
                        )}>
                          {isPositive ? '+' : ''}{balance.toLocaleString()} <span className="font-normal text-neutral-500">PKR</span>
                        </div>
                        <div className={clsx(
                          "text-sm mt-1",
                          isPositive ? "text-emerald-500" : 
                          isNegative ? "text-rose-500" : "text-neutral-500"
                        )}>
                          {isPositive ? 'Advance' : 
                           isNegative ? 'Amount Due' : 'Settled'}
                        </div>
                        <div className="text-xs text-neutral-400 mt-1">
                          {balanceSource}
                        </div>
                      </div>
                    );
                  },
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  width: '15%',
                  align: 'center' as const,
                  render: (customer: any) => (
                    <div className="flex justify-center py-2">
                      <button
                        type="button"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          goToDetails(customer.id || customer._id); 
                        }}
                        aria-label="Open customer details"
                        data-testid={`view-${customer.id || customer._id}`}
                        className="
                          inline-flex h-9 w-9 items-center justify-center
                          rounded-full
                          bg-neutral-900/90 text-white
                          hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40
                          transition-colors
                        "
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">View</span>
                      </button>
                    </div>
                  ),
                },
              ]}
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
              rowKey={(record) => record.id || record._id || Math.random().toString()}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} customers`,
                position: ['bottomCenter'],
                className: 'customer-pagination',
              }}
              className="customer-table"
              rowClassName="hover:bg-neutral-50 transition-colors cursor-pointer"
              size="middle"
              onRow={(record) => ({
                onClick: () => openQuickView(record),
                onKeyDown: (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    openQuickView(record);
                  }
                },
                tabIndex: 0,
                'data-testid': `row-${record.id || record._id}`,
                role: 'button',
                'aria-label': `View details for ${record.firstName} ${record.lastName}`,
              })}
            />
          </div>
        )}
      </div>

      {/* Customer Quick View Modal */}
      <CustomerQuickView
        customer={quickViewCustomer}
        visible={isQuickViewVisible}
        onClose={closeQuickView}
        dueAmount={(() => {
          try {
            if (!quickViewCustomer) return 0;
            const result = calculateCustomerDueAmount(quickViewCustomer.id || quickViewCustomer._id);
            return result.dueAmount;
          } catch (error) {
            console.error('Error calculating due amount for quick view:', error);
            return 0;
          }
        })()}
        outstandingOrdersCount={(() => {
          try {
            if (!quickViewCustomer) return 0;
            const result = calculateCustomerDueAmount(quickViewCustomer.id || quickViewCustomer._id);
            return result.outstandingOrdersCount;
          } catch (error) {
            console.error('Error calculating orders for quick view:', error);
            return 0;
          }
        })()}
      />

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
