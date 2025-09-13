// components/ProductCard.tsx
import { IProduct } from '@/types/products';
import clsx from 'clsx';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {  Modal, InputNumber } from 'antd';
import { useState } from 'react';
import { useUpdateProductQuantity } from '@/hooks/products';

interface ProductCardProps {
  product?: IProduct;
  className?: string;
  isLoading?: boolean;
}

const ProductCard = ({ product, className, isLoading }: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuantity, setNewQuantity] = useState<number>(product?.quantity || 0);

  const { updateProductQuantity: updateQuantity, isLoading: isUpdating } = useUpdateProductQuantity();

  const handleUpdate = async () => {
    await updateQuantity({
      productId: product?._id || '',
      quantity: newQuantity,
    });
    setIsModalOpen(false);
  };

  if (isLoading || !product) {
    return (
      <div className={clsx('rounded-xl bg-white p-6 min-h-[280px] shadow-lg border border-gray-100', className)}>
        {/* Header Skeleton */}
        <div className='pr-20'>
          <Skeleton height={24} className='mb-3' />
          <div className='mb-3'>
            <Skeleton height={24} className='w-24' />
          </div>
          <Skeleton count={2} className='mb-3' />
        </div>
        
        {/* Footer Skeleton */}
        <div className='mt-auto pt-4 border-t border-gray-200/50 bg-gradient-to-t from-gray-50/50 to-transparent'>
          <div className='flex items-center justify-between mb-4'>
            <Skeleton height={24} className='w-20' />
            <Skeleton height={24} className='w-16' />
          </div>
          <Skeleton height={48} className='w-full' />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Edit Modal */}
      <Modal
        title='Update Product Quantity'
        open={isModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsModalOpen(false)}
        okText='Update'
        cancelText='Cancel'
        confirmLoading={isUpdating}
        okButtonProps={{ disabled: isUpdating }}
        width='90%'
        centered
        className='mobile-modal'
      >
        <div className='space-y-4 py-2'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Product: <span className='font-semibold'>{product.name}</span>
            </label>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Current Stock: <span className='font-semibold'>{product.quantity}</span>
            </label>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              New Quantity
            </label>
            <InputNumber
              min={0}
              value={newQuantity}
              onChange={(value) => setNewQuantity(value || 0)}
              className='w-full'
              size='large'
              placeholder='Enter new quantity'
            />
          </div>
        </div>
      </Modal>
      <article
        className={clsx(
          'rounded-xl bg-white p-6 shadow-lg border border-gray-100',
          'relative flex flex-col justify-between min-h-[280px]',
          'transition-all duration-300 hover:shadow-xl hover:-translate-y-2',
          'backdrop-blur-sm bg-white/95 group',
          className,
        )}
        aria-labelledby={`product-${product._id?.toString() || 'unknown'}-title`}
      >
        {/* Edit Button - Desktop Optimized */}
        <div className='absolute right-4 top-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
          <button
            onClick={() => setIsModalOpen(true)}
            className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 active:scale-95 border border-blue-400/20 hover:shadow-xl'
            aria-label='Update product quantity'
          >
            <span className='text-white text-xl'>
              📦
            </span>
          </button>
        </div>
        {/* Header Section - Desktop Optimized */}
        <header className='pr-20'>
          <h3
            id={`product-${product._id?.toString() || 'unknown'}-title`}
            className='mb-3 text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors duration-200'
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Category Badge - Desktop Optimized */}
          <div className='mb-3'>
            <span className='inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-shadow duration-200'>
              {typeof product.categoryId === 'object' ? product.categoryId?.name || 'Uncategorized' : 'Uncategorized'}
            </span>
          </div>

          {product.shortDescription && (
            <p className='mb-3 text-sm text-gray-600 leading-relaxed line-clamp-3'>{product.shortDescription}</p>
          )}
        </header>

        {/* Urdu Description - Desktop Optimized */}
        {product.urduDescription && (
          <div className='mb-4'>
            <p
              className='text-right font-urdu text-sm leading-relaxed text-gray-700'
              dir='rtl'
              lang='ur'
            >
              {product.urduDescription}
            </p>
          </div>
        )}

        {/* Footer Section - Desktop Optimized */}
        <footer className='mt-auto pt-4 border-t border-gray-200/50 bg-gradient-to-t from-gray-50/50 to-transparent'>
          {/* Price and Size Row */}
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span
                className='text-blue-600 text-xl font-bold'
                aria-label={`Price: Rs. ${product.price}`}
              >
                Rs.{' '}
                {product.price.toLocaleString('en-PK', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              {product.size && (
                <span
                  className='text-sm text-gray-600 bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1.5 rounded-lg shadow-sm border border-gray-200'
                  aria-label={`Package size: ${product.size} ${product.packType}`}
                >
                  {product.size}
                  {product.packType.toLowerCase() === 'tabs' ? ' Tabs' : 'ml'}
                </span>
              )}
            </div>
          </div>

          {/* Stock Status - Desktop Optimized */}
          <div className='w-full'>
            <span
              className={clsx(
                'block w-full text-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg',
                product.quantity > 0
                  ? 'bg-gradient-to-r from-green-400 to-green-500 text-white border-0 shadow-green-500/30 hover:from-green-500 hover:to-green-600'
                  : 'bg-gradient-to-r from-red-400 to-red-500 text-white border-0 shadow-red-500/30 hover:from-red-500 hover:to-red-600',
              )}
              aria-live='polite'
            >
              {product.quantity > 0 ? (
                <>
                  📦 In Stock <span className='font-bold text-lg'>({product.quantity})</span>
                </>
              ) : (
                '❌ Out of Stock'
              )}
            </span>
          </div>
        </footer>
      </article>
    </>
  );
};

export default ProductCard;
