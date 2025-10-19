import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { openToast } from '@/utils/toaster';
import { getProfile, updateProfile } from '@/services/profile';
import type { IAPIError } from '@/types/api';
import Cookies from 'js-cookie';
import { useEffect } from 'react';

// Get user profile
export const useGetProfile = () => {
  const token = Cookies.get('token_js');
  const emailVerified = Cookies.get('emailVerified');
  
  // Debug logging
  console.log('🔍 useGetProfile Debug:', { 
    token: !!token, 
    tokenValue: token ? token.substring(0, 20) + '...' : null,
    emailVerified, 
    enabled: !!token,
    cookieKeys: Object.keys(Cookies.get())
  });
  
  const { data, isError, error, isFetching } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!token, // Only run if token exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes
  });

  // Log data changes
  useEffect(() => {
    console.log('🔍 useGetProfile: Data changed:', data);
    console.log('🔍 useGetProfile: isFetching:', isFetching);
    console.log('🔍 useGetProfile: isError:', isError);
    console.log('🔍 useGetProfile: error:', error);
  }, [data, isFetching, isError, error]);

  // If no valid token, return null profile and not loading
  if (!token) {
    console.log('⚠️ useGetProfile: No valid token');
    return { profile: null, isLoading: false, isError: false, error: null };
  }

  console.log('✅ useGetProfile: Query enabled, data:', data, 'isFetching:', isFetching, 'isError:', isError);
  console.log('🔍 useGetProfile: Profile data:', data?.data?.user);
  return { 
    profile: data?.data?.user, 
    isLoading: isFetching, 
    isError, 
    error 
  };
};

// Update user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    openToast('success', 'Profile updated successfully');
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message
      || error?.response?.message
      || error?.message
      || 'Failed to update profile',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['updateProfile'],
    mutationFn: updateProfile,
    onSuccess,
    onError,
  });

  return {
    updateProfile: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};
