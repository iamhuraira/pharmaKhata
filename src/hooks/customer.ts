import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IAPIError, IAPISuccess } from '@/types/api';
import { openToast } from '@/utils/toaster';
import { createCustomer, getAllCustomers } from '@/services/customer';
import { IGetAllCustomerResponse } from '@/types/me';

export const useGetAllCustomers = () => {
  const { data, isLoading, isError, error } = useQuery<IGetAllCustomerResponse, Error>({
    queryKey: ['customer'],
    queryFn: getAllCustomers,
  });

  return {
    customers: data?.customers || [],
    isLoading,
    isError,
    error: error?.message,
  };
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  const onSuccess = (data: IAPISuccess) => {
    queryClient.invalidateQueries({ queryKey: ['customer'] });
    openToast(
      'success',
      data?.response?.data?.message ||
        data?.response?.message ||
        data?.message ||
        'Something went wrong',
    );
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        'Something went wrong',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['createCustomer'],
    mutationFn: createCustomer,
    onSuccess,
    onError,
  });

  return {
    createCustomer: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};
