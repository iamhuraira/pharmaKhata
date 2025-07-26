import { z } from 'zod';

import { commonValidations } from './commonValidation';

export const LoginUserValidationSchema = z
  .object({
      phone: commonValidations.phone,
      password: commonValidations.password,
  })
  .strict();

export const RegisterUserValidationSchema = z
  .object({
    firstName: z.string({ required_error: 'First name is required' }).min(2),
    lastName: z.string({ required_error: 'Last name is required' }).min(2),
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Invalid email address' }),
    password: commonValidations.password,
    confirmPassword: z.string({
      required_error: 'Confirm password is required',
    }),
  })
  .strict()
  .refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

export const ForgotPasswordValidationSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Invalid email address' }),
  })
  .strict();

export const ResetPasswordValidationSchema = z
  .object({
    newPassword: commonValidations.password,
    confirmPassword: z.string({
      required_error: 'Confirm password is required',
    }),
  })
  .strict()
  .refine(data => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });
