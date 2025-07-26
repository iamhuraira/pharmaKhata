'use client';

import { Formik } from 'formik';
import React from 'react';
import { toFormikValidationSchema } from 'zod-formik-adapter';

import Button from '@/components/Button/Button';
import GoogleButton from '@/components/Button/GoogleButton';
import Input from '@/components/Input/Input';
import ORText from '@/components/ORText';
import Typography from '@/components/Typography';
import { colors } from '@/constants/ui';
import { useSignup } from '@/hooks/auth';
import type { ISignupPayload } from '@/types/auth';
import { RegisterUserValidationSchema } from '@/validations/auth';

const SignupForm = () => {
  const { signup, isLoading } = useSignup();

  const initialValues: ISignupPayload = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const handleSubmit = (values: ISignupPayload) => {
    signup(values);
  };

  return (
    <div className="flex flex-col gap-3">
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={toFormikValidationSchema(
          RegisterUserValidationSchema,
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
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-12 gap-3 ">
              <div className="col-span-12 md:col-span-6 ">
                <Input
                  type="text"
                  label="First Name"
                  name="firstName"
                  placeholder="Your first name"
                  onChange={handleChange}
                  value={values.firstName}
                  onBlur={handleBlur}
                  error={!!touched.firstName && !!errors.firstName}
                  helperText={errors.firstName}
                />
              </div>
              <div className="col-span-12 md:col-span-6 ">
                <Input
                  type="text"
                  label="Last Name"
                  name="lastName"
                  placeholder="Your last name"
                  onChange={handleChange}
                  value={values.lastName}
                  onBlur={handleBlur}
                  error={!!touched.lastName && !!errors.lastName}
                  helperText={errors.lastName}
                />
              </div>
            </div>
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
            <Input
              type="password"
              label="Password"
              name="password"
              placeholder="Enter your password"
              onChange={handleChange}
              value={values.password}
              onBlur={handleBlur}
              error={!!touched.password && !!errors.password}
              helperText={errors.password}
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
            <Button loading={isLoading} type="submit" w_full>
              Sign Up
            </Button>
          </form>
        )}
      </Formik>

      <ORText />
      <GoogleButton onClick={() => {}} />

      <div className="mt-3 flex items-center justify-center">
        <Typography
          type="body"
          color={colors.subtle}
          size="sm"
          style={{ margin: 0 }}
        >
          Already have an account?
          {' '}
          <Typography type="link" href="/sign-in">
            Sign In
          </Typography>
        </Typography>
      </div>
    </div>
  );
};

export default SignupForm;
