import React from 'react';

import Typography from './Typography';

type IProps = {
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  className?: string;
  name?: string;
  children: React.ReactNode;
  value?: any;
  error?: boolean;
  helperText?: string;
  label?: string;
};

const Select = ({
  onChange,
  onBlur,
  children = '',
  name = '',
  className,
  value,
  error,
  helperText,
  label,
}: IProps) => {
  return (
    <>
      <div className={`flex flex-col ${className}`}>
        {label && (
          <label
            htmlFor={name}
            className="mb-[5px] text-sm font-medium leading-6 text-dark md:text-[1rem]"
          >
            {label}
          </label>
        )}
        <select
          className={`w-full rounded border ${error ? '!border-red-500' : 'border-subtle'} bg-white px-4 py-2 text-subtle `}
          onChange={onChange}
          onBlur={onBlur}
          name={name}
          value={value}
        >
          {children}
        </select>
        {helperText && error && (
          <Typography type="error">{helperText}</Typography>
        )}
      </div>
    </>
  );
};

export default Select;
