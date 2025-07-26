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

  const { updateProductQuantity: updateQuantity } = useUpdateProductQuantity();

  const handleUpdate = async () => {
    await updateQuantity({
      productId: product?._id || '',
      quantity: newQuantity,
    });
    setIsModalOpen(false);
  };

  if (isLoading || !product) {
    return (
      <div className={clsx('rounded-lg border border-gray-200 bg-white p-1', className)}>
        <Skeleton count={2} />
        <div className='mt-4'>
          <Skeleton width={100} />
          <Skeleton width={80} className='ml-2' />
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
        okText='Add'
        cancelText='Cancel'
      >
        <div className='mt-4'>
          <InputNumber
            min={0}
            value={newQuantity}
            onChange={(value) => setNewQuantity(value || 0)}
            className='w-full'
          />
        </div>
      </Modal>
      <article
        className={clsx(
          'rounded-lg bg-white p-3 shadow-md transition-shadow hover:shadow-lg',
          'border border-gray-200 hover:ring-2 hover:ring-secondary',
          'relative flex flex-col justify-between',
          className,
        )}
        aria-labelledby={`product-${product._id}-title`}
      >
        <Tooltip title='Edit Quantity' placement='top'>
          <Button
            type='primary'
            shape='circle'
            icon={<EditOutlined className='text-white' />}
            onClick={() => setIsModalOpen(true)}
            className='bg-primary-600 hover:bg-primary-700 absolute right-2 top-2 z-10 flex !h-9 !w-9 items-center justify-center border-2 border-white shadow-lg transition-all duration-300 hover:scale-110 hover:transform hover:shadow-lg'
            style={{
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
        </Tooltip>
        {/* Header Section */}
        <header>
          <h3
            id={`product-${product._id}-title`}
            className='mb-1 truncate text-base font-semibold text-gray-800'
            title={product.name}
          >
            {product.name}
          </h3>

          {product.shortDescription && (
            <p className='mb-1 line-clamp-2 text-xs text-gray-600'>{product.shortDescription}</p>
          )}
        </header>

        {/* Urdu Description */}
        {product.urduDescription && (
          <div className='mb-1'>
            <p
              className='text-right font-urdu text-sm leading-relaxed text-gray-700'
              dir='rtl'
              lang='ur'
            >
              {product.urduDescription}
            </p>
          </div>
        )}

        {/* Footer Section */}
        <footer className='mt-1'>
          <div className='flex items-center justify-between'>
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
                  className='text-sm text-gray-500'
                  aria-label={`Package size: ${product.size} ${product.packType}`}
                >
                  ({product.size}
                  {product.packType.toLowerCase() === 'tabs' ? ' Tablets' : 'ml'})
                </span>
              )}
            </div>

            <span
              className={clsx(
                'rounded px-2 py-1 text-sm transition-colors',
                'whitespace-nowrap font-medium',
                product.quantity > 0
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-red-100 text-red-800 hover:bg-red-200',
              )}
              aria-live='polite'
            >
              {product.quantity > 0 ? (
                <>
                  In Stock <span className=''>({product.quantity})</span>
                </>
              ) : (
                'Out of Stock'
              )}
            </span>
          </div>
        </footer>
      </article>
    </>
  );
};

export default ProductCard;
