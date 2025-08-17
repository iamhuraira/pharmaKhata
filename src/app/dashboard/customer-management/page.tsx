import React from 'react';

import type { Metadata } from 'next';
import CustomerManagement from '@/components/customer-management/CustomerManagement';

export const metadata: Metadata = {
  title: 'Customer Management',
  description: 'Stock Management',
};
const CustomerManagementPage = () => {
  return (
    <>
      <CustomerManagement />
    </>
  );
};

export default CustomerManagementPage;
