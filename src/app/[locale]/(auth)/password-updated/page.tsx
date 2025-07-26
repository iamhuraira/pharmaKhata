import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import password_updated_success from '@/assets/images/success_pass_change.png';
import Button from '@/components/Button/Button';
import Card from '@/components/Card';
import Typography from '@/components/Typography';
import { colors } from '@/constants/ui';

export const metadata: Metadata = {
  title: 'Password Reset',
  description: 'Password Updated',
};

const PasswordUpdated = () => {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 bg-[#FEFEFE] p-5 shadow-none xs:px-3 xs:pt-2 md:mt-4 md:min-w-[550px] md:bg-white md:p-11 md:shadow-card ">
      <Image
        src={password_updated_success}
        alt="Password Updated"
        className="size-[88px] "
      />
      <div className="flex flex-col gap-1 md:gap-3 md:mt-3">
        <Typography type="title" align="center" size="lg" style={{ margin: 0 }}>
          Password Reset
        </Typography>
        <Typography
          type="body"
          size="regular"
          align="center"
          color={colors.subtle}
          className="mb-5 px-3"
        >
          Your password has been successfully reset. Click below to sign in.
        </Typography>
      </div>
      <Link className="w-full" href="/sign-in">
        <Button w_full>Sign In</Button>
      </Link>
    </Card>
  );
};

export default PasswordUpdated;
