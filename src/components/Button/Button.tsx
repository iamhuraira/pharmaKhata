'use client';

import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import React from 'react';

type IProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
  outlined?: boolean;
  secondary?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  w_full?: boolean;
  ref?: React.RefObject<HTMLButtonElement>;
};

const Button = ({
  children,
  style,
  onClick,
  disabled,
  loading,
  type = 'button',
  className,
  w_full,
  outlined,
  secondary,
  ref,
}: IProps) => {
  if (secondary) {
    className
      = '!text-light !bg-[#9E9E9E3D]  !hover:bg-[#9E9E9E] !active:bg-[#9E9E9E]';
  }

  if (outlined) {
    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`relative flex cursor-pointer items-center justify-center rounded-md border-2 border-primary  bg-white p-3 px-5 font-poppins text-base font-medium leading-6 text-primary hover:bg-[#f0f0f0] active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 ${className} ${
          w_full ? 'w-full' : ''
        }`}
        style={style}
      >
        <div className={`${loading ? 'opacity-0 ' : ''}`}>{children}</div>
        {loading && (
          <Spin className="absolute" indicator={<LoadingOutlined spin />} />
        )}
      </button>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative flex cursor-pointer items-center justify-center rounded-md border-none bg-primary p-3 px-5 font-poppins text-sm font-medium leading-6 text-white hover:bg-primaryDark active:bg-primaryDarker disabled:cursor-not-allowed disabled:opacity-50 ${className} ${
        w_full ? 'w-full' : ''
      }`}
      style={style}
    >
      <div className={`${loading ? 'opacity-0 ' : ''}`}>{children}</div>
      {loading && (
        <Spin className="absolute" indicator={<LoadingOutlined spin />} />
      )}
    </button>
  );
};

export default Button;
