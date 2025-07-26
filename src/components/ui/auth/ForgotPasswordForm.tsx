'use client';

import { Formik } from 'formik';
import Cookies from 'js-cookie';
import React from 'react';
import { toFormikValidationSchema } from 'zod-formik-adapter';

import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import Typography from '@/components/Typography';
import { useForgotPassword } from '@/hooks/auth';
import type { IForgotPasswordPayload } from '@/types/auth';
import { ForgotPasswordValidationSchema } from '@/validations/auth';

const ForgotPasswordForm = () => {
  const initialValues = {
    email: '',
  };

  const { forgotPassword, isLoading } = useForgotPassword();

  const handleSubmit = (values: IForgotPasswordPayload) => {
    forgotPassword(values);
    Cookies.set('FPEmail', values.email, { expires: 1 });
  };

  return (
    <div className="flex flex-col gap-3 ">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={toFormikValidationSchema(
          ForgotPasswordValidationSchema,
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
              type="email"
              label="Email"
              name="email"
              placeholder="Your email address"
              onChange={handleChange}
              value={values.email}
              onBlur={handleBlur}
              error={!!touched.email && !!errors.email}
              helperText={errors.email}
            />
            <Button
              loading={isLoading}
              type="submit"
              className="bg-primary text-white"
            >
              Reset Password
            </Button>
            <div className="flex justify-center">
              <Typography type="link" href="/sign-in">
                Back to Sign In
              </Typography>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default ForgotPasswordForm;
