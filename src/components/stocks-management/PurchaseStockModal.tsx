"use client";

import React, { useState, useEffect } from 'react';

interface PurchaseStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: any;
}

interface PurchaseFormData {
  productId: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  method: 'cash' | 'jazzcash' | 'bank' | 'card' | 'other';
  note: string;
  invoiceNo: string;
  date: string;
}

const PurchaseStockModal: React.FC<PurchaseStockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product
}) => {
  const [formData, setFormData] = useState<PurchaseFormData>({
    productId: '',
    quantity: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    method: 'cash',
    note: '',
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0] || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<any[]>([]);
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
        productId: product._id.toString(),
        sellingPrice: product.price || 0,
        purchasePrice: (product as any).purchasePrice || 0
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
      [name]: name === 'quantity' || name === 'purchasePrice' || name === 'sellingPrice' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const calculateTotal = () => {
    return (formData.quantity * formData.purchasePrice).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.productId || formData.quantity <= 0 || formData.purchasePrice < 0) {
      setError('Please fill in all required fields with valid values');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/stocks/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: formData.productId,
          quantity: formData.quantity,
          purchasePrice: formData.purchasePrice,
          sellingPrice: formData.sellingPrice > 0 ? formData.sellingPrice : undefined,
          method: formData.method,
          note: formData.note,
          invoiceNo: formData.invoiceNo,
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
          purchasePrice: 0,
          sellingPrice: 0,
          method: 'cash',
          note: '',
          invoiceNo: '',
          date: new Date().toISOString().split('T')[0] || '' as string
        });
      } else {
        setError(data.message || 'Failed to purchase stock');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-dark font-poppins">
              Purchase Stock
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
                      {product.name} - Current Stock: {product.quantity} - Price: Rs. {product.price}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Purchase Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  step="1"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter quantity"
                />
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Purchase Price (per unit) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter purchase price"
                />
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Selling Price (per unit)
                </label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter selling price (optional)"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Payment Method
                </label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  name="invoiceNo"
                  value={formData.invoiceNo}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter invoice number"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Purchase Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
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

            {/* Total Amount Display */}
            <div className="bg-primaryLighter p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-dark">Total Purchase Amount:</span>
                <span className="text-2xl font-bold text-primary">Rs. {calculateTotal()}</span>
              </div>
            </div>

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
                disabled={isLoading}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Purchase Stock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseStockModal;
