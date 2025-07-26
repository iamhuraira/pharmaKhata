import type { Metadata } from 'next';
import React from 'react';

import Card from '@/components/Card';
import Typography from '@/components/Typography';
import ChangePasswordForm from '@/components/ui/auth/ChangePasswordForm';
import { colors } from '@/constants/ui';

export const metadata: Metadata = {
  title: 'Change Password',
  description: 'Change Password',
};

const ChangePassword = () => {
  return (
    <>
      <div className="flex flex-col gap-1 md:gap-3 md:mt-5">
        <Typography type="title" align="center" size="lg" style={{ margin: 0 }}>
          Change Password
        </Typography>
        <Typography
          type="body"
          size="regular"
          align="center"
          color={colors.subtle}
          className="px-3"
        >
          Must be at least 8 characters.
        </Typography>
      </div>
      <Card className="bg-[#FEFEFE] p-5 shadow-none xs:px-3 xs:pt-2 md:mt-4 md:min-w-[550px] md:bg-white md:p-11 md:shadow-card ">
        <ChangePasswordForm />
      </Card>
    </>
  );
};

export default ChangePassword;
