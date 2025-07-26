'use client';

import React from 'react';

import { SearchIcon } from '../svg-components';

type IProps = {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  name?: string;
  error?: boolean;
};

const SearchInput = ({
  value,
  onChange,
  placeholder,
  name,
  error = false,
}: IProps) => {
  return (
    <div
      className={`flex items-center gap-2 rounded-[8px] border border-subtle bg-white p-3 px-3.5 focus-within:border-2 focus-within:border-primary focus-within:outline-none ${error ? '!border-red-500' : 'border-subtle'}`}
    >
      <SearchIcon className="size-6 text-light" />
      <input
        type="text"
        className={`peer  w-[90%] text-base leading-6 text-dark outline-none placeholder:text-sm placeholder:text-subtle `}
        placeholder={placeholder || 'Search For Something...'}
        value={value}
        onChange={onChange}
        name={name}
      />
    </div>
  );
};

export default SearchInput;
