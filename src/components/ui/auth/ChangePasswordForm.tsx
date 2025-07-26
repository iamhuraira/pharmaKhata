'use client';

import { Formik } from 'formik';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toFormikValidationSchema } from 'zod-formik-adapter';

import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import ORText from '@/components/ORText';
import Typography from '@/components/Typography';
import { useUpdatePassword } from '@/hooks/me';
import { ResetPasswordValidationSchema } from '@/validations/auth';

type IChangePasswordFormProps = {
  newPassword: string;
  confirmPassword: string;
};

const ChangePasswordForm = () => {
  const { updatePassword, isLoading } = useUpdatePassword();
  const router = useRouter();

  const initialValues: IChangePasswordFormProps = {
    newPassword: '',
    confirmPassword: '',
  };

  const handleSubmit = (value: IChangePasswordFormProps) => {
    updatePassword({
      password: value.newPassword,
      confirmPassword: value.confirmPassword,
    });
  };

  return (
    <div className="flex flex-col gap-3 ">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={toFormikValidationSchema(
          ResetPasswordValidationSchema,
        )}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form className="flex flex-col gap-5 " onSubmit={handleSubmit}>
            <Input
              type="password"
              label="New Password"
              name="newPassword"
              placeholder="Your new password"
              onChange={handleChange}
              value={values.newPassword}
              onBlur={handleBlur}
              error={!!touched.newPassword && !!errors.newPassword}
              helperText={errors.newPassword}
            />
            <Input
              type="password"
              label="Confirm Password"
              name="confirmPassword"
              placeholder="Confirm your password"
              onChange={handleChange}
              value={values.confirmPassword}
              onBlur={handleBlur}
              error={!!touched.confirmPassword && !!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
            <Button
              type="submit"
              loading={isLoading}
              className="bg-primary text-white"
            >
              Change Password
            </Button>
          </form>
        )}
      </Formik>

      <ORText />
      <Button onClick={() => router.push('/dashboard/')} outlined>
        Go to Dashboard
      </Button>

      <div className="flex justify-center">
        <Typography type="link" className="mt-3" href="/sign-in">
          Back to Sign In
        </Typography>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
