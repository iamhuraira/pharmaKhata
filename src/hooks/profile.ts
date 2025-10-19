import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { openToast } from '@/utils/toaster';
import { getProfile, updateProfile } from '@/services/profile';
import type { IAPIError } from '@/types/api';
import Cookies from 'js-cookie';

// Get user profile
export const useGetProfile = () => {
  const token = Cookies.get('token_js');
  
  
  const { data, isError, error, isFetching } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!token, // Only run if token exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes
  });


  // If no valid token, return null profile and not loading
  if (!token) {
    return { profile: null, isLoading: false, isError: false, error: null };
  }
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
