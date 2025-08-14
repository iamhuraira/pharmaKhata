import { Types } from 'mongoose';
import {UserRoles, UserStatus} from "@/types/enums";


export interface IAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface IPermissions {
  id: string;
  name: string;
  description: string;
}

export interface IRoles {
  id: string;
  name: UserRoles;
  permissions: IPermissions[];
}

export interface IUser {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  role: IRoles | Types.ObjectId;
  status: UserStatus;
  phone: string;
  address?: IAddress;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profilePicture?: string;
}

export interface IUserDoc extends IUser, Document {
  password: string;
  emailVerificationOTP: string | null;
  phoneVerificationOTP: string | null;
  forgotPasswordOTP: string | null;
  passwordUpdateRequested: boolean;
  accessToken: string | null;
  TFAEnabled: boolean;
  TFAOTP: string | null;
}
