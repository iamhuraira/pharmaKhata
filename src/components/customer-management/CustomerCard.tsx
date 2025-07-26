// components/CustomerCard.tsx
import { ICustomer } from '@/types/me';
import clsx from 'clsx';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Button, Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons';

interface CustomerCardProps {
  customer?: ICustomer;
  className?: string;
  isLoading?: boolean;
}

const CustomerCard = ({ customer, className, isLoading }: CustomerCardProps) => {
  if (isLoading || !customer) {
    return (
      <div className={clsx('rounded-lg border border-gray-200 bg-white p-3', className)}>
        <Skeleton count={2} />
        <div className='mt-4'>
          <Skeleton width={100} />
          <Skeleton width={80} className='ml-2' />
        </div>
      </div>
    );
  }

  return (
    <article
      className={clsx(
        'rounded-lg bg-white p-3 shadow-md transition-shadow hover:shadow-lg',
        'border border-gray-200 hover:ring-2 hover:ring-secondary',
        'relative flex flex-col justify-between',
        className,
      )}
      aria-labelledby={`customer-${customer.id}-title`}
    >
      <Tooltip title='Edit Customer' placement='top'>
        <Button
          type='primary'
          shape='circle'
          icon={<EditOutlined className='text-white' />}
          className='bg-primary-600 hover:bg-primary-700 absolute right-2 top-2 z-10 flex !h-9 !w-9 items-center justify-center border-2 border-white shadow-lg transition-all duration-300 hover:scale-110 hover:transform hover:shadow-lg'
          style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
      </Tooltip>

      {/* Header Section */}
      <header>
        <h3
          id={`customer-${customer.id}-title`}
          className='mb-1 truncate text-base font-semibold text-gray-800'
          title={`${customer.firstName} ${customer.lastName}`}
        >
          {customer.firstName} {customer.lastName}
        </h3>
      </header>

      {/* Body Section */}
      <div className='mt-1'>
        <p className='text-sm text-gray-600'>
          <span className='font-medium'>Phone:</span> {customer.phone}
        </p>
      </div>

      {/* Footer Section */}
      <footer className='mt-2'>
        <div className='flex items-center justify-between'>
          <span
            className={clsx(
              'rounded px-2 py-1 text-sm transition-colors',
              'whitespace-nowrap bg-blue-100 font-medium text-blue-800',
            )}
          >
            Active Customer
          </span>
        </div>
      </footer>
    </article>
  );
};

export default CustomerCard;
