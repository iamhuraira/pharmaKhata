import type { IAPIResponse, IAPISuccess } from '@/types/api';

import type { UserStatus } from './enums';

export type IAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

export type IPermissions = {
  id: string;
  name: string;
  description: string;
};

export type IUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  role: IRole;
  status: UserStatus;
  phone: string;
  address?: IAddress;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profilePicture?: string;
  TFAEnabled: boolean;
};

// Define the Role type used inside the user object
export type IRole = {
  _id: string;
  name: string;
  permissions: IPermission[];
};

// Define the Permission type used inside the Role type
export type IPermission = {
  _id: string;
  name: string;
  description: string;
};

export type IUpdatePasswordPayload = {
  password: string;
  confirmPassword: string;
};

export type IChnagePasswordUsingCurrentPasswordPayload = {
  currentPassword: string;
  password: string;
  confirmPassword: string;
};

export type IGetMeResponse = {
  user: IUser;
} & IAPIResponse;

export type IUserResponse = {
  _id: string;
  email: string;
  TFAEnabled: boolean;
  TFAOTP: string | null;
  accessToken: string;
  createdAt: string;
  currentAddress: IAddress;
  emailVerificationOTP: string;
  emailVerified: boolean;
  firstName: string;
  forgotPasswordOTP: string | null;
  lastName: string;
  passwordUpdateRequested: boolean;
  phone: string;
  phoneVerificationOTP: string;
  phoneVerified: boolean;
  postalAddress: IAddress;
  role: IRole;
  status: string;
  updatedAt: string;
  username: string;
  websites: string[]; // Array of website IDs
  workspaces: string[]; // Array of workspaces
};

export type IVerifyEmailPayload = {
  otp: string;
};

export type IUpdatePasswordResponse = {} & IAPIResponse;

export type IChangePasswordUsingCurrentPasswordResponse = {} & IAPIResponse;

export type IUpdateMePayload = {
  firstName: string;
  lastName: string;
};

export type TGetMeService = () => Promise<IGetMeResponse>;

export type TUpdateMeService = (payload: IUpdateMePayload) => Promise<IAPIResponse>;

export type TUpdatePasswordService = (
  payload: IUpdatePasswordPayload,
) => Promise<IUpdatePasswordResponse>;

export type TChnagePasswordUsingCureentPasswordService = (
  payload: IChnagePasswordUsingCurrentPasswordPayload,
) => Promise<IChangePasswordUsingCurrentPasswordResponse>;

export type TGetUserResponse = {
  user: IUserResponse;
} & IAPIResponse;

export type TGetMe = () => Promise<TGetUserResponse>;

export type TRequestEmailVerification = () => Promise<IAPIResponse>;

export type TVerifyEmail = (payload: IVerifyEmailPayload) => Promise<IAPIResponse>;

export type TEnableTFAService = () => Promise<IAPIResponse>;
export type TDisableTFAService = () => Promise<IAPIResponse>;

export type ICustomer = IUser;
export type ICreateNewCustomer = Pick<ICustomer, 'firstName' | 'lastName' | 'phone'>;
export type TCreateCustomerService = (payload: ICreateNewCustomer) => Promise<IAPISuccess>;
export type IGetAllCustomerResponse = {
  customers: ICustomer[];
} & IAPIResponse;
export type TGetAllCustomersService = () => Promise<IGetAllCustomerResponse>;
export type TCreateCustomer = Omit<ICustomer, '_id' | 'createdAt' | 'updatedAt'>;
