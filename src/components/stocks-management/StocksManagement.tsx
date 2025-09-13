'use client';
import React from 'react';
import ProductList from '@/components/stocks-management/ProductList';
import { ShoppingOutlined, BarChartOutlined, DollarOutlined, InboxOutlined } from '@ant-design/icons';
import { Card, Row, Col, Statistic } from 'antd';
import { useGetAllProducts } from '@/hooks/products';

const StocksManagement = () => {
  const { products, isLoading } = useGetAllProducts();

  // Calculate statistics
  const totalProducts = products?.length || 0;
  const inStockProducts = products?.filter(p => p.quantity > 0).length || 0;
  const outOfStockProducts = products?.filter(p => p.quantity === 0).length || 0;
  const totalValue = products?.reduce((sum, p) => sum + (p.price * p.quantity), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <ShoppingOutlined className="text-3xl text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
                <p className="text-gray-600 text-lg">Manage your product inventory and stock levels</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-6 py-6">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-300">
              <Statistic
                title={<span className="text-gray-600 font-medium">Total Products</span>}
                value={totalProducts}
                prefix={<InboxOutlined className="text-blue-500" />}
                valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }}
                loading={isLoading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-300">
              <Statistic
                title={<span className="text-gray-600 font-medium">In Stock</span>}
                value={inStockProducts}
                prefix={<BarChartOutlined className="text-green-500" />}
                valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 'bold' }}
                loading={isLoading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-300">
              <Statistic
                title={<span className="text-gray-600 font-medium">Out of Stock</span>}
                value={outOfStockProducts}
                prefix={<BarChartOutlined className="text-red-500" />}
                valueStyle={{ color: '#ff4d4f', fontSize: '28px', fontWeight: 'bold' }}
                loading={isLoading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-300">
              <Statistic
                title={<span className="text-gray-600 font-medium">Total Value</span>}
                value={totalValue}
                precision={0}
                suffix="PKR"
                prefix={<DollarOutlined className="text-purple-500" />}
                valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 'bold' }}
                loading={isLoading}
              />
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* Product List Section */}
      <div className="px-6 pb-6">
        <Card className="shadow-sm">
          <ProductList />
        </Card>
      </div>
    </div>
  );
};

export default StocksManagement;
