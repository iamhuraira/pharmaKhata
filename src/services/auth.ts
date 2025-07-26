import type {
  TForgotPasswordService,
  TResendTfaOtpService,
  TSigninService,
  TSignupService,
  TVerifyForgotPasswordOtpService,
  TVerifyTfaOtpService,
} from '@/types/auth';
import api from '@/utils/api';

export const signin: TSigninService = async (payload) => {
  const { data } = await api.post('/auth/login', {
    ...payload,
  });

  return data;
};

export const signUp: TSignupService = async (payload) => {
  const { data } = await api.post('/auth/register', {
    ...payload,
  });

  return data;
};

export const forgotPassword: TForgotPasswordService = async (payload) => {
  const { data } = await api.put(
    '/auth/request-forgot-password-otp',
    {},
    {
      params: payload,
    },
  );

  return data;
};

export const verifyOtp: TVerifyForgotPasswordOtpService = async (payload) => {
  const { data } = await api.get('/auth/verify-forgot-password-otp', {
    params: payload,
  });

  return data;
};

export const resendTFAOtp: TResendTfaOtpService = async (payload) => {
  const { data } = await api.get('/auth/resend-tfa-otp', {
    params: payload,
  });

  return data;
};

export const verifyTfaOtp: TVerifyTfaOtpService = async (payload) => {
  const { data } = await api.post(
    '/auth/verify-tfa-otp',
    {},
    {
      params: payload,
    },
  );

  return data;
};
