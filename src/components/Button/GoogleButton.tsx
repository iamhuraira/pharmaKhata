import React from 'react';

import { GoogleIcon } from '../svg-components';
import Typography from '../Typography';

type IProps = {
  onClick: () => void;
  buttonText?: string;
};

const GoogleButton = ({
  onClick,
  buttonText = ' Continue with Google',
}: IProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shadow-custom flex cursor-pointer items-center justify-center gap-[0.7rem] rounded-md border border-subtle bg-white p-3 px-5 text-base font-medium leading-6 text-dark hover:bg-gray-100 active:bg-gray-200 disabled:cursor-not-allowed disabled:bg-subtle"
    >
      <GoogleIcon />
      <Typography type="body" size="lg" m="0" p="0">
        {buttonText}
      </Typography>
      {' '}
    </button>
  );
};

export default GoogleButton;
