import React from 'react';

import Card from '@/components/Card';
import Typography from '@/components/Typography';
import ForgotPasswordForm from '@/components/ui/auth/ForgotPasswordForm';
import { colors } from '@/constants/ui';

export async function generateMetadata() {
  return {
    title: 'Forgot Password',
    description: 'Forgot Password',
  };
}

const ForgotPassword = () => {
  return (
    <>
      <div className="flex flex-col gap-1 md:gap-3 md:mt-5">
        <Typography type="title" size="lg" align="center" style={{ margin: 0 }}>
          Forgot Password?
        </Typography>
        <Typography
          type="body"
          size="regular"
          align="center"
          color={colors.subtle}
          className="px-3"
        >
          Enter your account's email address and we'll send you a secure link to
          reset your password.
        </Typography>
      </div>
      <Card className="bg-[#FEFEFE] p-5 shadow-none xs:px-3 xs:pt-2 md:mt-4 md:min-w-[550px] md:bg-white md:p-11 md:shadow-card ">
        <ForgotPasswordForm />
      </Card>
    </>
  );
};

export default ForgotPassword;
