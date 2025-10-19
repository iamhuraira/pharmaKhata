"use client";

import React, { useState, useEffect } from 'react';

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

interface ReduceStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

interface ReduceStockFormData {
  productId: string;
  quantity: number;
  reason: string;
  method: 'other' | 'cash' | 'jazzcash' | 'bank' | 'card';
  note: string;
  referenceNo: string;
  date: string;
}

const ReduceStockModal: React.FC<ReduceStockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product
}) => {
  const [formData, setFormData] = useState<ReduceStockFormData>({
    productId: '',
    quantity: 0,
    reason: 'stock_adjustment',
    method: 'other',
    note: '',
    referenceNo: '',
    date: new Date().toISOString().split('T')[0] || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Load products when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  // Set product data when product prop changes
  useEffect(() => {
    if (product) {
      setFormData(prev => ({
        ...prev,
        productId: product._id,
        quantity: 0 // Reset quantity when product changes
      }));
    }
  }, [product]);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch('/api/products?limit=1000');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data.products);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const getSelectedProduct = () => {
    return products.find(p => p._id === formData.productId);
  };

  const getMaxQuantity = () => {
    const selectedProduct = getSelectedProduct();
    return selectedProduct ? selectedProduct.quantity : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.productId || formData.quantity <= 0) {
      setError('Please fill in all required fields with valid values');
      return;
    }

    const selectedProduct = getSelectedProduct();
    if (!selectedProduct) {
      setError('Please select a valid product');
      return;
    }

    if (formData.quantity > selectedProduct.quantity) {
      setError(`Cannot reduce more than available stock. Available: ${selectedProduct.quantity}`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/stocks/reduce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: formData.productId,
          quantity: formData.quantity,
          reason: formData.reason,
          method: formData.method,
          note: formData.note,
          referenceNo: formData.referenceNo,
          date: formData.date
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          productId: '',
          quantity: 0,
          reason: 'stock_adjustment',
          method: 'other',
          note: '',
          referenceNo: '',
          date: new Date().toISOString().split('T')[0] || ''
        });
      } else {
        setError(data.message || 'Failed to reduce stock');
      }
    } catch (error) {
      console.error('Reduce stock error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedProduct = getSelectedProduct();
  const maxQuantity = getMaxQuantity();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-dark font-poppins">
              Reduce Stock
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Product <span className="text-red-500">*</span>
              </label>
              {isLoadingProducts ? (
                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
                  Loading products...
                </div>
              ) : (
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} - Current Stock: {product.quantity}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Current Stock Display */}
            {selectedProduct && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-dark">Current Stock:</span>
                  <span className="text-lg font-bold text-blue-600">{selectedProduct.quantity}</span>
                </div>
              </div>
            )}

            {/* Quantity to Reduce */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Quantity to Reduce <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                max={maxQuantity}
                step="1"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={`Enter quantity (max: ${maxQuantity})`}
              />
              {maxQuantity > 0 && (
                <p className="text-sm text-light mt-1">
                  Maximum: {maxQuantity} units
                </p>
              )}
            </div>

            {/* Reason for Reduction */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Reason for Reduction
              </label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="stock_adjustment">Stock Adjustment</option>
                <option value="damaged_goods">Damaged Goods</option>
                <option value="expired_products">Expired Products</option>
                <option value="theft">Theft</option>
                <option value="return_to_supplier">Return to Supplier</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Method */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Method
              </label>
              <select
                name="method"
                value={formData.method}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="other">Other</option>
                <option value="cash">Cash</option>
                <option value="jazzcash">JazzCash</option>
                <option value="bank">Bank Transfer</option>
                <option value="card">Card</option>
              </select>
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Reference Number
              </label>
              <input
                type="text"
                name="referenceNo"
                value={formData.referenceNo}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter reference number"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Note
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter any additional notes"
              />
            </div>

            {/* New Stock Display */}
            {selectedProduct && formData.quantity > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-dark">New Stock After Reduction:</span>
                  <span className="text-lg font-bold text-yellow-600">
                    {selectedProduct.quantity - formData.quantity}
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || formData.quantity <= 0 || formData.quantity > maxQuantity}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Reduce Stock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReduceStockModal;
