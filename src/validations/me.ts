import { z } from 'zod';

import { commonValidations } from '@/validations/commonValidation';

export const UserNameSchema = z
  .string()
  .min(3, { message: 'Username must be at least 3 characters long' })
  .max(20, { message: 'Username must be at most 20 characters long' })
  .regex(/[a-z]/i, {
    message: 'Username must contain at least one alphabetic character',
  })
  .regex(/^[\w@#]+$/, {
    message:
      'Username can only contain alphanumeric characters and @, #, _ symbols',
  });

export const UpdateUserValidation = z
  .object({
    username: UserNameSchema,
    firstName: z.string({ required_error: 'First name is required' }).min(2),
    lastName: z.string({ required_error: 'Last name is required' }).min(2),
    phone: z
      .string({
        required_error: 'Phone number is required',
      })
      .regex(/^\+?\d+$/, {
        message:
          'Phone number can only contain numbers and an optional leading +',
      })
      .min(13, {
        message: 'Phone number must be at least 13 digits',
      }),
  })
  .strict();

export const UpdatePasswordValidation = z
  .object({
    currentPassword: commonValidations.password,
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
