import React from 'react';
import { StocksManagement } from '@/components/stocks-management';

export const metadata = {
  title: 'Stock Management - Pharma Khata',
  description: 'Manage your inventory and purchase new stock',
};

export default function StocksPage() {
  return (
    <div className="min-h-screen bg-subtleBg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StocksManagement />
      </div>
    </div>
  );
}
