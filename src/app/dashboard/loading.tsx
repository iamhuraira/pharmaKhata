import { Spin } from 'antd';
import React from 'react';

const Loading = () => {
  return (
    <div className="w-full justify-center flex items-center mt-10">
      <Spin size="large" />
    </div>
  );
};

export default Loading;
