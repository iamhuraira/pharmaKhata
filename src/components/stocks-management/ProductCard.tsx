// components/ProductCard.tsx
import { IProduct } from '@/types/products';
import clsx from 'clsx';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Button, Modal, InputNumber, Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons';
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
      <div className={clsx('rounded-xl bg-white p-3 min-h-[160px] shadow-lg border-0', className)}>
        {/* Header Skeleton */}
        <div className='pr-16'>
          <Skeleton height={20} className='mb-1' />
          <div className='mb-1'>
            <Skeleton height={20} className='w-20' />
          </div>
          <Skeleton count={1} className='mb-2' />
        </div>
        
        {/* Footer Skeleton */}
        <div className='mt-auto pt-2 border-t border-gray-200/50 bg-gradient-to-t from-gray-50/50 to-transparent'>
          <div className='flex items-center justify-between mb-2'>
            <Skeleton height={20} className='w-16' />
            <Skeleton height={20} className='w-12' />
          </div>
          <Skeleton height={32} className='w-full' />
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
          'rounded-xl bg-white p-3 shadow-lg border-0',
          'relative flex flex-col justify-between min-h-[160px]',
          'transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
          'backdrop-blur-sm bg-white/95',
          className,
        )}
        aria-labelledby={`product-${product._id}-title`}
      >
        {/* Rectangular Edit Button */}
        <div className='absolute right-2 top-2 z-50'>
          <button
            onClick={() => setIsModalOpen(true)}
            className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md transition-all duration-200 hover:bg-blue-700 active:bg-blue-800 active:scale-95 border border-blue-500/20'
            aria-label='Update product quantity'
            style={{ backgroundColor: '#2563eb', color: 'white' }}
          >
            <span className='text-white text-lg' style={{ color: 'white' }}>
              📦
            </span>
          </button>
        </div>
        {/* Header Section - Mobile Optimized */}
        <header className='pr-16'>
          <h3
            id={`product-${product._id}-title`}
            className='mb-1 text-base font-semibold text-gray-900 leading-tight'
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Category Badge - Single line for mobile */}
          <div className='mb-1'>
            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'>
              {product.categoryId.name}
            </span>
          </div>

          {product.shortDescription && (
            <p className='mb-2 text-xs text-gray-600 leading-relaxed line-clamp-2'>{product.shortDescription}</p>
          )}
        </header>

        {/* Urdu Description - Mobile Optimized */}
        {product.urduDescription && (
          <div className='mb-2'>
            <p
              className='text-right font-urdu text-xs leading-relaxed text-gray-700'
              dir='rtl'
              lang='ur'
            >
              {product.urduDescription}
            </p>
          </div>
        )}

        {/* Footer Section - Mobile Optimized */}
        <footer className='mt-auto pt-2 border-t border-gray-200/50 bg-gradient-to-t from-gray-50/50 to-transparent'>
          {/* Price and Size Row */}
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center gap-2'>
              <span
                className='text-primary-600 text-base font-bold'
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
                  className='text-xs text-gray-600 bg-gradient-to-r from-gray-100 to-gray-200 px-2 py-1 rounded-lg shadow-sm border border-gray-200'
                  aria-label={`Package size: ${product.size} ${product.packType}`}
                >
                  {product.size}
                  {product.packType.toLowerCase() === 'tabs' ? ' Tabs' : 'ml'}
                </span>
              )}
            </div>
          </div>

          {/* Stock Status - Full Width for Mobile */}
          <div className='w-full'>
            <span
              className={clsx(
                'block w-full text-center rounded-lg px-2 py-1.5 text-xs font-medium transition-all duration-300 shadow-md',
                product.quantity > 0
                  ? 'bg-gradient-to-r from-green-400 to-green-500 text-white border-0 shadow-green-500/30'
                  : 'bg-gradient-to-r from-red-400 to-red-500 text-white border-0 shadow-red-500/30',
              )}
              aria-live='polite'
            >
              {product.quantity > 0 ? (
                <>
                  📦 In Stock <span className='font-bold'>({product.quantity})</span>
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
