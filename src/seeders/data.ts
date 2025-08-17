import { UpdateQuery } from 'mongoose';
import mongoose from 'mongoose';

import { UserRoles } from '@/lib/constants/enums';
import { IUserDoc } from '@/lib/types/users';
import { env } from '@/config/envConfig';
const { ObjectId } = mongoose.Types;

export const devUsers: UpdateQuery<IUserDoc>[] = [
  // Super Admin User
  {
    _id: new ObjectId('60f8f8e2b3f8d53b6c98b5a1'),
    firstName: 'Super',
    lastName: 'Admin',
    password: '12345Aa!',
    passwordUpdateRequested: false,
    role: UserRoles.SUPER_ADMIN,
    status: 'active',
    phone: '03086173323',
    currentAddress: {
      street: '1 Super Admin Street',
      city: 'Islamabad',
      state: 'Capital',
      country: 'Pakistan',
    },
    phoneVerified: true,
    profilePicture: '',
    phoneVerificationOTP: '',
    forgotPasswordOTP: null,
    accessToken: '',
    TFAEnabled: true,
    TFAOTP: '',
  },
  // Admin User
  {
    _id: new ObjectId('60f8f8e2b3f8d53b6c98b5a2'),
    firstName: 'Admin',
    lastName: 'User',
    password: '12345Aa!',
    passwordUpdateRequested: false,
    role: UserRoles.ADMIN,
    status: 'active',
    phone: '03086173324',
    currentAddress: {
      street: '100 Admin St',
      city: 'Lahore',
      state: 'Punjab',
      country: 'Pakistan',
    },
    phoneVerified: true,
    profilePicture: '',
    phoneVerificationOTP: '',
    forgotPasswordOTP: null,
    accessToken: '',
    TFAEnabled: true,
    TFAOTP: '',
  },
  // Regular User
  {
    _id: new ObjectId('60f8f8e2b3f8d53b6c98b5a3'),
    firstName: 'Normal',
    lastName: 'User',
    password: '12345Aa!',
    passwordUpdateRequested: false,
    role: UserRoles.USER,
    status: 'active',
    phone: '03086173325',
    currentAddress: {
      street: '200 User Avenue',
      city: 'Karachi',
      state: 'Sindh',
      country: 'Pakistan',
    },
    phoneVerified: true,
    profilePicture: '',
    phoneVerificationOTP: '',
    forgotPasswordOTP: null,
    accessToken: '',
    TFAEnabled: false,
    TFAOTP: '',
  },
  // Customer User
  {
    _id: new ObjectId('60f8f8e2b3f8d53b6c98b5a4'),
    firstName: 'Customer',
    lastName: 'User',
    password: '12345Aa!',
    passwordUpdateRequested: false,
    role: UserRoles.CUSTOMER,
    status: 'active',
    phone: '03086173326',
    currentAddress: {
      street: '1 Customer Street',
      city: 'Islamabad',
      state: 'Capital',
      country: 'Pakistan',
    },
    phoneVerified: true,
    profilePicture: '',
    phoneVerificationOTP: '',
    forgotPasswordOTP: null,
    accessToken: '',
    TFAEnabled: false,
    TFAOTP: '',
  },
];

const prodUsers: UpdateQuery<IUserDoc>[] = [
  // Super Admin User
  {
    firstName: 'Super',
    lastName: 'Admin',
    password: '12345Aa!',
    passwordUpdateRequested: false,
    role: UserRoles.SUPER_ADMIN,
    status: 'active',
    phone: '111-222-3333',
    currentAddress: {
      street: '1 Super Admin Street',
      city: 'Islamabad',
      state: 'Capital',
      country: 'Pakistan',
    },
    phoneVerified: true,
    profilePicture: '',
    phoneVerificationOTP: '',
    forgotPasswordOTP: null,
    accessToken: '',
    TFAEnabled: true,
    TFAOTP: '',
  },
  // Admin User
  {
    firstName: 'Admin',
    lastName: 'User',
    password: '12345Aa!',
    passwordUpdateRequested: false,
    role: UserRoles.ADMIN,
    status: 'active',
    phone: '222-333-4444',
    currentAddress: {
      street: '100 Admin St',
      city: 'Lahore',
      state: 'Punjab',
      country: 'Pakistan',
    },
    phoneVerified: true,
    profilePicture: '',
    phoneVerificationOTP: '',
    forgotPasswordOTP: null,
    accessToken: '',
    TFAEnabled: true,
    TFAOTP: '',
  },
  // Regular User
  {
    firstName: 'Normal',
    lastName: 'User',
    password: '12345Aa!',
    passwordUpdateRequested: false,
    role: UserRoles.USER,
    status: 'active',
    phone: '333-444-5555',
    currentAddress: {
      street: '200 User Avenue',
      city: 'Karachi',
      state: 'Sindh',
      country: 'Pakistan',
    },
    phoneVerified: true,
    profilePicture: '',
    phoneVerificationOTP: '',
    forgotPasswordOTP: null,
    accessToken: '',
    TFAEnabled: false,
    TFAOTP: '',
  },
  // Customer User
  {
    firstName: 'Customer',
    lastName: 'User',
    password: '12345Aa!',
    passwordUpdateRequested: false,
    role: UserRoles.CUSTOMER,
    status: 'active',
    phone: '444-555-6666',
    currentAddress: {
      street: '1 Customer Street',
      city: 'Islamabad',
      state: 'Capital',
      country: 'Pakistan',
    },
    phoneVerified: true,
    profilePicture: '',
    phoneVerificationOTP: '',
    forgotPasswordOTP: null,
    accessToken: '',
    TFAEnabled: false,
    TFAOTP: '',
  },
];

let users: UpdateQuery<IUserDoc>[] = [];
switch (env.NODE_ENV) {
  case 'development':
    users = devUsers;
    break;
  case 'production':
    users = prodUsers;
    break;
  default:
    users = devUsers;
}

export { users };
