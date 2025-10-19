"use client";

import React, { useState, useEffect } from 'react';
import PurchaseStockModal from './PurchaseStockModal';
import ReduceStockModal from './ReduceStockModal';

interface Product {
  _id: string;
  name: string;
  shortDescription?: string;
  quantity: number;
  price: number;
  purchasePrice?: number;
  categoryId: {
    _id: string;
    name: string;
  };
  size?: number;
  packType: string;
  createdAt: string;
  updatedAt: string;
}

interface StocksManagementProps {
  className?: string;
}

const StocksManagement: React.FC<StocksManagementProps> = ({ className = '' }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isReduceModalOpen, setIsReduceModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setTotalPages(data.data.pagination.totalPages);
        setTotalProducts(data.data.pagination.totalProducts);
      } else {
        setError(data.message || 'Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseClick = (product: Product) => {
    setSelectedProduct(product);
    setIsPurchaseModalOpen(true);
  };

  const handleReduceClick = (product: Product) => {
    setSelectedProduct(product);
    setIsReduceModalOpen(true);
  };

  const handlePurchaseSuccess = () => {
    loadProducts(); // Refresh the list
    setSelectedProduct(null);
  };

  const handleReduceSuccess = () => {
    loadProducts(); // Refresh the list
    setSelectedProduct(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark font-poppins">Stock Management</h1>
            <p className="text-light mt-1">Manage your inventory and purchase new stock</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primaryDark transition-colors duration-200 font-medium"
            >
              Purchase Stock
            </button>
            <button
              onClick={() => setIsReduceModalOpen(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              Reduce Stock
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-6 border-b border-gray-200">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primaryDark transition-colors duration-200 font-medium"
          >
            Search
          </button>
        </form>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={loadProducts}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primaryDark transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-dark">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark">Stock</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark">Selling Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark">Purchase Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-dark">{product.name}</div>
                          {product.shortDescription && (
                            <div className="text-sm text-light">{product.shortDescription}</div>
                          )}
                          {product.size && (
                            <div className="text-sm text-light">
                              {product.size} {product.packType}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-light">
                        {product.categoryId?.name || 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          product.quantity > 10 
                            ? 'bg-green-100 text-green-800' 
                            : product.quantity > 0 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-dark">
                        Rs. {product.price.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-light">
                        Rs. {(product.purchasePrice || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePurchaseClick(product)}
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors duration-200 text-sm font-medium"
                          >
                            Purchase
                          </button>
                          <button
                            onClick={() => handleReduceClick(product)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                            disabled={product.quantity <= 0}
                          >
                            Reduce
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === page
                            ? 'bg-primary text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {/* Summary */}
            <div className="mt-6 text-center text-light">
              Showing {filteredProducts.length} of {totalProducts} products
            </div>
          </>
        )}
      </div>

      {/* Purchase Modal */}
      <PurchaseStockModal
        isOpen={isPurchaseModalOpen}
        onClose={() => {
          setIsPurchaseModalOpen(false);
          setSelectedProduct(null);
        }}
        onSuccess={handlePurchaseSuccess}
        product={selectedProduct}
      />

      {/* Reduce Stock Modal */}
      <ReduceStockModal
        isOpen={isReduceModalOpen}
        onClose={() => {
          setIsReduceModalOpen(false);
          setSelectedProduct(null);
        }}
        onSuccess={handleReduceSuccess}
        product={selectedProduct}
      />
    </div>
  );
};

export default StocksManagement;