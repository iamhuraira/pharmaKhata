import React from 'react';

import { colors } from '@/constants/ui';

import { ArrowForwardIcon } from '../svg-components';
import Typography from '../Typography';

const ViewAllButton = () => {
  return (
    <button
      type="button"
      className="shadow-custom flex cursor-pointer items-center justify-center gap-[0.7rem] rounded-md border border-subtle p-3 px-5 text-base font-medium leading-6 text-dark hover:bg-gray-100 active:bg-gray-200 disabled:cursor-not-allowed disabled:bg-subtle"
    >
      <Typography type="body" color={colors.light} size="lg" m="0" p="0">
        View All
      </Typography>
      {' '}
      <ArrowForwardIcon />
    </button>
  );
};

export default ViewAllButton;
