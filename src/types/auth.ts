import type { IAPIResponse } from './api';

export type ISigninPayload = {
  phone?: string;
  password: string;
};

export type ISignupPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type IForgotPasswordPayload = {
  email: string;
};

export type IResendForgotPasswordOtpPayload = {
  email: string;
  otp: string;
};

export type IResendTfaOtpPayload = {
  email?: string;
  phone?: string;
  username?: string;
};

export type IVerifyTfaOtpPayload = {
  email?: string;
  otp: string;
};

// responses

export type ISigninResponse = {
  // TFAEnabled: boolean;
  role: string;
  token: string | null;
  phone: string;
  // emailVerified: boolean;
  // email: string;
} & IAPIResponse;

export type ISignupResponse = {
  token: string | null;
  email: string;
} & IAPIResponse;

export type IVerifyOtpResponse = {
  token: string | null;
} & IAPIResponse;

export type IVerifyTfaOtpResponse = {
  token: string | null;
  email: string;
  TFAEnabled: boolean;
} & IAPIResponse;

export type TSigninService = (
  payload: ISigninPayload
) => Promise<ISigninResponse>;

export type TSignupService = (
  payload: ISignupPayload
) => Promise<ISignupResponse>;

export type TForgotPasswordService = (
  payload: IForgotPasswordPayload
) => Promise<IAPIResponse>;

export type TVerifyForgotPasswordOtpService = (
  payload: IResendForgotPasswordOtpPayload
) => Promise<IVerifyOtpResponse>;

export type TResendTfaOtpService = (
  payload: IForgotPasswordPayload
) => Promise<IAPIResponse>;

export type TVerifyTfaOtpService = (
  payload: IVerifyTfaOtpPayload
) => Promise<IVerifyTfaOtpResponse>;
