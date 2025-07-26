import React from 'react';

type IProps = {
  children: React.ReactNode;
  className?: string;
};

const Card = ({ children, className = '' }: IProps) => {
  return (
    <div
      className={`${className}  w-full rounded-lg bg-white md:p-6 shadow-card `}
    >
      {children}
    </div>
  );
};

export default Card;
