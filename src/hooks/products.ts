import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllProducts, updateProductQuantity } from '@/services/product';
import { IGetAllProductsResponse } from '@/types/products';
import { IAPIError, IAPISuccess } from '@/types/api';
import { openToast } from '@/utils/toaster';

export const useGetAllProducts = () => {
  const { data, isLoading, isError, error } = useQuery<IGetAllProductsResponse, Error>({
    queryKey: ['products'],
    queryFn: getAllProducts,
  });

  return {
    products: data?.products || [],
    isLoading,
    isError,
    error: error?.message,
  };
};

export const useUpdateProductQuantity = () => {
  const queryClient = useQueryClient();

  const onSuccess = (data: IAPISuccess) => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
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
    mutationKey: ['updateProductQuantity'],
    mutationFn: updateProductQuantity,
    onSuccess,
    onError,
  });

  return {
    updateProductQuantity: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};
