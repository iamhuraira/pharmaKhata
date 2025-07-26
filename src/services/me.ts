import type {
  TChnagePasswordUsingCureentPasswordService,
  TDisableTFAService,
  TEnableTFAService,
  TGetMeService,
  TRequestEmailVerification,
  TUpdateMeService,
  TUpdatePasswordService,
  TVerifyEmail,
} from '@/types/me';
import api from '@/utils/api';

export const updatePassword: TUpdatePasswordService = async (payload) => {
  const { data } = await api.put('/users/me/update-password', {
    ...payload,
  });

  return data;
};

export const getMe: TGetMeService = async () => {
  const { data } = await api.get('/users/me');

  return data;
};

export const requestEmailVerification: TRequestEmailVerification = async () => {
  const { data } = await api.put('/users/request-email-verification-otp');

  return data;
};

export const verifyEmail: TVerifyEmail = async (payload) => {
  const { data } = await api.put(
    '/users/verify-email',
    {},
    {
      params: {
        otp: payload.otp,
      },
    },
  );

  return data;
};

export const enableTFA: TEnableTFAService = async () => {
  const { data } = await api.put('/users/me/enable-tfa');

  return data;
};

export const disableTFA: TDisableTFAService = async () => {
  const { data } = await api.put('/users/me/disable-tfa');

  return data;
};

export const updateMe: TUpdateMeService = async (payload) => {
  const { data } = await api.put('/users/me', { ...payload });

  return data;
};

export const changePasswordUsingCurrentPassword: TChnagePasswordUsingCureentPasswordService
  = async (payload) => {
    const { data } = await api.put(
      '/users/change-password-using-current-password',
      {
        ...payload,
      },
    );

    return data;
  };
