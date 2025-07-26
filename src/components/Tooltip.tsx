'use client';

import React, { useState } from 'react';

import Typography from './Typography';

type IProps = {
  children: React.ReactNode;
  text: string;
};

const Tooltip = ({ children, text }: IProps) => {
  const [visible, setVisible] = useState(false);

  // const showTooltip = () => setVisible(true);
  // const hideTooltip = () => setVisible(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full left-1/2 z-10 mb-3 -translate-x-1/2 whitespace-nowrap rounded bg-light px-2 py-1 text-white shadow-lg">
          <Typography type="body" size="sm" color="white">
            {text}
          </Typography>
          {/* Tooltip Arrow */}
          <div className="absolute -bottom-4 left-1/2 size-0 -translate-x-1/2 border-8 border-transparent border-t-light"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
