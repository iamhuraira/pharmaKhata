import type { IAPIResponse } from '@/types/api';
import type { UserStatus } from './enums';

export type IProfileAddress = {
  street: string;
  city: string;
  state: string;
  country: string;
};

export type IProfileUser = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  status: UserStatus;
  role: string;
  currentAddress?: IProfileAddress;
  createdAt: string;
  updatedAt: string;
};

export type IGetProfileResponse = {
  success: boolean;
  data: {
    user: IProfileUser;
  };
} & IAPIResponse;

export type IUpdateProfilePayload = {
  firstName: string;
  lastName: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  address?: IProfileAddress;
};

export type IUpdateProfileResponse = {
  success: boolean;
  data: {
    user: IProfileUser;
  };
} & IAPIResponse;

export type TGetProfileService = () => Promise<IGetProfileResponse>;
export type TUpdateProfileService = (payload: IUpdateProfilePayload) => Promise<IUpdateProfileResponse>;
