import clsx from 'clsx';
import React from 'react';

import { colors } from '@/constants/ui';

import Typography from './Typography';

const defaultOptions: string[] = [];

type IProps = {
  options: string[];
  selected?: string;
  setSelected: (value: string) => void;
};

const Tabs = ({
  options = defaultOptions,
  selected = options[0],
  setSelected,
}: IProps) => {
  return (
    <div className="flex">
      <div className="flex items-center gap-4">
        {options.map(option => (
          <button
            key={option}
            type="button"
            className={clsx('p-2', selected === option && 'border-b-2 border-primary')}
            onClick={() => setSelected(option)}
          >
            <Typography
              type="body"
              size="lg"
              color={selected === option ? colors.dark : colors.subtle}
            >
              {option}
            </Typography>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
