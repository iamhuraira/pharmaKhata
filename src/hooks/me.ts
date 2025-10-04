import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

import {
  changePasswordUsingCurrentPassword,
  disableTFA,
  enableTFA,
  getMe,
  requestEmailVerification,
  updateMe,
  updatePassword,
  verifyEmail,
} from '@/services/me';
import type { IAPIError, IAPIResponse } from '@/types/api';
import { openToast } from '@/utils/toaster';

export const useUpdatePassword = () => {
  const router = useRouter();
  const onSuccess = () => {
    openToast('success', 'Password updated successfully');
    Cookies.set('passwordUpdated', 'true');
    Cookies.remove('allowChangePassword');
    Cookies.remove('FPEmail');
    router.push('/password-updated');
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message
      || error?.response?.message
      || error?.message
      || 'Something went wrong',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['updatePassword'],
    mutationFn: updatePassword,
    onSuccess,
    onError,
  });

  return {
    updatePassword: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

export const useGetMe = () => {
  const token = Cookies.get('token_js');
  const emailVerified = Cookies.get('emailVerified');
  
  // Debug logging
  console.log('🔍 useGetMe Debug:', { 
    token: !!token, 
    tokenValue: token ? token.substring(0, 20) + '...' : null,
    emailVerified, 
    enabled: !!token,
    cookieKeys: Object.keys(Cookies.get())
  });
  
  const { data, isError, error, isFetching } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false, // Don't retry on failure
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    enabled: !!token, // Only require token, email verification is optional for development
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes
  });

  // If no valid token, return null user and not loading
  if (!token) {
    console.log('⚠️ useGetMe: No valid token');
    return { user: null, isLoading: false, isError: false, error: null };
  }

  console.log('✅ useGetMe: Query enabled, data:', data, 'isFetching:', isFetching, 'isError:', isError);
  return { user: data?.user, isLoading: isFetching, isError, error };
};

export const useRequestEmailVerification = () => {
  const onSuccess = () => {
    openToast('success', 'Email verification code sent successfully');
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message
      || error?.response?.message
      || error?.message
      || 'Something went wrong',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['requestEmailVerification'],
    mutationFn: requestEmailVerification,
    onSuccess,
    onError,
  });

  return {
    requestEmailVerification: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

export const useVerifyEmail = () => {
  const router = useRouter();
  const onSuccess = () => {
    Cookies.remove('VFEmail');
    Cookies.set('emailVerified', 'true');

    openToast('success', 'Email verified successfully');
    router.push('/dashboard');
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message
      || error?.response?.message
      || error?.message
      || 'Something went wrong',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['verifyEmail'],
    mutationFn: verifyEmail,
    onSuccess,
    onError,
  });

  return {
    verifyEmail: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

export const useEnableTwoFactorAuth = () => {
  const queryClient = useQueryClient();

  const onSuccess = (data: IAPIResponse) => {
    queryClient.invalidateQueries({ queryKey: ['me'] });
    openToast('success', data.message);
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message
      || error?.response?.message
      || error?.message
      || 'Something went wrong',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['enableTwoFactorAuth'],
    mutationFn: enableTFA,
    onSuccess,
    onError,
  });

  return {
    enableTwoFactorAuth: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

export const useDisableTwoFactorAuth = () => {
  const queryClient = useQueryClient();

  const onSuccess = (data: IAPIResponse) => {
    queryClient.invalidateQueries({ queryKey: ['me'] });
    openToast('success', data.message);
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message
      || error?.response?.message
      || error?.message
      || 'Something went wrong',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['disableTwoFactorAuth'],
    mutationFn: disableTFA,
    onSuccess,
    onError,
  });

  return {
    disableTwoFactorAuth: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['me'] });
    openToast('success', 'Data Updated successfully');
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message
      || error?.response?.message
      || error?.message
      || 'Something went wrong',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['updateMe'],
    mutationFn: updateMe,
    onSuccess,
    onError,
  });

  return {
    updateMe: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

export const useChangePasswordUsingCurrentPassword = () => {
  const onSuccess = () => {
    openToast('success', 'Password updated successfully');
    Cookies.set('passwordUpdated', 'true');
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message
      || error?.response?.message
      || error?.message
      || 'Something went wrong',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['chnagePasswordUsingCurrentPassword'],
    mutationFn: changePasswordUsingCurrentPassword,
    onSuccess,
    onError,
  });

  return {
    changePasswordUsingCurrentPassword: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};
