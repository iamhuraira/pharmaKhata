'use client';

import React from 'react';

import {
  LogoutIcon,
} from '@/components/svg-components';
import Typography from '@/components/Typography';
import { useLogout } from '@/hooks/auth';

const AvatarMenu = () => {
  const { logout } = useLogout();

  return (
    <div className="absolute right-5 top-[-20px] lg:right-8 lg:top-[70px] z-40 flex w-[270px] flex-col rounded-lg border border-subtle bg-[white] shadow-lg">

      <div
        className="flex w-full cursor-pointer items-center p-4 hover:bg-[#6E51D929] "
        onClick={logout}
      >
        <LogoutIcon className=" mr-3" />
        <Typography type="body" size="lg">
          Logout
        </Typography>
      </div>
    </div>
  );
};

export default AvatarMenu;
