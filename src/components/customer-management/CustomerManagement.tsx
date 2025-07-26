// components/CustomerManagement.tsx
'use client';
import { useState } from 'react';
import { Button, Input, Modal } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import CustomerCard from './CustomerCard';
import { ICustomer } from '@/types/me';
import { useCreateCustomer, useGetAllCustomers } from '@/hooks/customer';

const customerSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{11}$/, 'Invalid phone number (11 digits required)'),
});

const CustomerManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createCustomer, isLoading } = useCreateCustomer();
  const { customers, isLoading: isLoadingCustomers } = useGetAllCustomers();

  const initialValues: Pick<ICustomer, 'firstName' | 'lastName' | 'phone'> = {
    firstName: '',
    lastName: '',
    phone: '',
  };

  const handleSubmit = async (values: typeof initialValues) => {
    await createCustomer(values);
    setIsModalOpen(false);
  };

  return (
    <div className='p-6'>
      <div className='mb-6 flex flex-col items-start justify-between gap-2'>
        <h2 className='text-2xl font-bold'>Customers</h2>
        <Button
          type='primary'
          className={'bg-primary hover:bg-primaryDark'}
          icon={<UserAddOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Customer
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {isLoadingCustomers
          ? Array.from({ length: 3 }).map((_, index) => <CustomerCard key={index} isLoading />)
          : customers?.map((customer) => <CustomerCard key={customer.id} customer={customer} />)}
      </div>

      <Modal
        title='Create New Customer'
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={customerSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit }) => (
            <Form>
              <div className='mt-4 space-y-4'>
                <div>
                  <label className='mb-1 block text-sm font-medium'>First Name *</label>
                  <Field name='firstName' as={Input} placeholder='New' />
                  <ErrorMessage
                    name='firstName'
                    component='div'
                    className='mt-1 text-sm text-red-500'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-medium'>Last Name *</label>
                  <Field name='lastName' as={Input} placeholder='Customer' />
                  <ErrorMessage
                    name='lastName'
                    component='div'
                    className='mt-1 text-sm text-red-500'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-medium'>Phone Number *</label>
                  <Field name='phone' as={Input} placeholder='03086173320' />
                  <ErrorMessage
                    name='phone'
                    component='div'
                    className='mt-1 text-sm text-red-500'
                  />
                </div>

                <div className='mt-6 flex justify-end gap-2'>
                  <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type='primary' onClick={() => handleSubmit()} disabled={isLoading}>
                    Create Customer
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
