import React from 'react';

import { colors } from '@/constants/ui';

import Typography from './Typography';

const ORText = () => {
  return (
    <div className="flex items-center justify-center">
      <hr className=" flex-1 border border-solid border-subtle " />
      <Typography
        type="body"
        color={colors.subtle}
        size="sm"
        style={{ margin: '5px 1rem' }}
      >
        OR
      </Typography>
      <hr className="flex-1 border border-solid border-subtle" />
    </div>
  );
};

export default ORText;
