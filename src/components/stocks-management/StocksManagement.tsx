'use client';
import React from 'react';
import ProductList from '@/components/stocks-management/ProductList';
import { ShoppingOutlined } from '@ant-design/icons';

const StocksManagement = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <ShoppingOutlined className="text-2xl text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
            <p className="text-gray-600">Manage your product inventory and stock levels</p>
          </div>
        </div>
      </div>
      
      {/* Product List */}
      <ProductList />
    </div>
  );
};

export default StocksManagement;
