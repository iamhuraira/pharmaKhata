"use client";

import React from 'react';
import { Avatar, Card, Tag, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
interface IUser {
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
}

const { Text, Title } = Typography;

interface CustomerCardProps {
  customer: IUser;
  dueAmount: number;
  outstandingOrdersCount: number;
}

export default function CustomerCard({ customer, dueAmount, outstandingOrdersCount }: CustomerCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'pending':
        return 'orange';
      default:
        return 'default';
    }
  };

  const handleCardClick = () => {
    // Navigate to customer detail page
    window.location.href = `/dashboard/customer-management/${customer.id}`;
  };

  return (
    <>
      <Card 
        className='hover:shadow-lg transition-all duration-300 cursor-pointer mx-0 border-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col'
        onClick={handleCardClick}
      >
        <div className='flex-1 flex flex-col'>
          {/* Header Section - Name and Status Only */}
          <div className='flex items-center space-x-3 mb-3'>
            <div className='relative flex-shrink-0'>
              <Avatar 
                size={40} 
                icon={<UserOutlined />} 
                className='bg-gradient-to-br from-primary to-blue-600 shadow-sm'
              />
              <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                customer.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            </div>
            <div className='flex-1 min-w-0'>
              <Title level={5} className='!mb-1 !text-sm !font-bold text-gray-800 leading-tight truncate'>
                {customer.firstName} {customer.lastName}
              </Title>
              <Tag 
                color={getStatusColor(customer.status || 'active')} 
                className='text-xs font-medium px-1.5 py-0.5 rounded-full border-0 text-white'
              >
                {customer.status || 'active'}
              </Tag>
            </div>
          </div>
          
          {/* Balance Section - Most Important Info */}
          <div className='mb-3 flex-1'>
            {dueAmount > 0 ? (
              <div className='text-center p-2 bg-red-50 rounded-lg border border-red-200'>
                <div className='flex items-center justify-center space-x-1 mb-1'>
                  <div className='w-2 h-2 rounded-full bg-red-500 animate-pulse'></div>
                  <Text className='text-xs font-bold text-red-600'>AMOUNT DUE</Text>
                </div>
                <div className='flex items-center justify-center space-x-1 mb-1'>
                  <Text className='text-lg font-black text-red-600'>{dueAmount.toLocaleString()}</Text>
                  <Text className='text-xs text-red-500 font-bold'>PKR</Text>
                </div>
                {outstandingOrdersCount > 0 && (
                  <Text className='text-xs text-gray-600'>
                    {outstandingOrdersCount} order(s) pending
                  </Text>
                )}
              </div>
            ) : customer.balance && customer.balance > 0 ? (
              <div className='text-center p-2 bg-green-50 rounded-lg border border-green-200'>
                <div className='flex items-center justify-center space-x-1 mb-1'>
                  <div className='w-2 h-2 rounded-full bg-green-500'></div>
                  <Text className='text-xs font-bold text-green-600'>ADVANCE</Text>
                </div>
                <div className='flex items-center justify-center space-x-1 mb-1'>
                  <Text className='text-lg font-black text-green-600'>{customer.balance.toLocaleString()}</Text>
                  <Text className='text-xs text-green-500 font-bold'>PKR</Text>
                </div>
              </div>
            ) : (
              <div className='text-center p-2 bg-gray-50 rounded-lg border border-gray-200'>
                <div className='flex items-center justify-center space-x-1 mb-1'>
                  <div className='w-2 h-2 rounded-full bg-gray-500'></div>
                  <Text className='text-xs font-bold text-gray-600'>BALANCED</Text>
                </div>
                <Text className='text-xs text-gray-600'>No outstanding amount</Text>
              </div>
            )}
          </div>
        </div>
        

      </Card>


    </>
  );
}
