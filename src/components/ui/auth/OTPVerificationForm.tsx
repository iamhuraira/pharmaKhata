'use client';

import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';

import Button from '@/components/Button/Button';
import Card from '@/components/Card';
import OTPInput from '@/components/Input/OTPInput';
import Typography from '@/components/Typography';
import { colors } from '@/constants/ui';
import { useForgotPassword, useVerifyOtp } from '@/hooks/auth';

const OTPVerificationForm = () => {
  const { verifyOtp, isLoading } = useVerifyOtp();
  const { forgotPassword } = useForgotPassword();

  const [otp, setOtp] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsTouched(true);

    if (!error && !isTouched) {
      verifyOtp({ email, otp });
    }
  };

  useEffect(() => {
    const email = Cookies.get('FPEmail');
    if (email) {
      setEmail(email);
    }
  }, []);

  useEffect(() => {
    if (otp.length === 5) {
      setError(null);
      setIsTouched(false);
    } else {
      setError('Please enter a valid OTP');
    }
  }, [otp]);

  return (
    <>
      <div className="flex gap-2">
        <div className="flex flex-col gap-1 md:gap-3 md:mt-5">
          <Typography
            type="title"
            align="center"
            size="lg"
            style={{ margin: 0 }}
          >
            Verification Code
          </Typography>
          <div className="flex gap-2">
            <Typography
              type="body"
              p="0"
              size="regular"
              align="center"
              color={colors.subtle}
              className="px-3"
            >
              We sent a code to
            </Typography>
            <Typography
              type="body"
              p="0"
              size="lg"
              color={colors.dark}
              className="px-3"
            >
              {email}
            </Typography>
          </div>
        </div>
      </div>
      <Card className="bg-[#FEFEFE] p-5 shadow-none xs:pt-2 md:mt-4 md:min-w-[550px] md:bg-white md:p-11 md:shadow-card ">
        <div className="flex flex-col gap-3 ">
          <form className="flex flex-col gap-8 " onSubmit={handleSubmit}>
            <OTPInput
              value={otp}
              onChange={setOtp}
              onBlur={() => setIsTouched(true)}
              length={5}
              separator={<span></span>}
              error={isTouched && !!error}
              helperText={error as string}
            />

            <Button
              loading={isLoading}
              type="submit"
              className="bg-primary text-white"
            >
              Verify OTP
            </Button>
          </form>

          <div className="mt-3 flex items-center justify-center">
            <Typography
              type="body"
              color={colors.subtle}
              size="sm"
              style={{ margin: 0 }}
            >
              Didn’t receive the email?
              {' '}
              <button
                type="button"
                className="text-primary"
                onClick={() => forgotPassword({ email })}
              >
                <Typography type="link">Click to Resend</Typography>
              </button>
            </Typography>
          </div>
          <div className="flex justify-center">
            <Typography type="link" href="/sign-in">
              Back to Sign In
            </Typography>
          </div>
        </div>
      </Card>
    </>
  );
};

export default OTPVerificationForm;
