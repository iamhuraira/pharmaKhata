import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IAPIError, IAPISuccess } from '@/types/api';
import { openToast } from '@/utils/toaster';

// Mock API functions for now - these should be implemented in services
const getOrders = async (params?: any) => {
  const queryString = new URLSearchParams();
  if (params?.status) queryString.append('status', params.status);
  if (params?.from) queryString.append('from', params.from);
  if (params?.to) queryString.append('to', params.to);
  if (params?.q) queryString.append('q', params.q);
  if (params?.page) queryString.append('page', params.page.toString());
  if (params?.limit) queryString.append('limit', params.limit.toString());

  const response = await fetch(`/api/orders?${queryString}`);
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
};

const createOrder = async (orderData: any) => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create order');
  }
  
  return response.json();
};

const getOrderById = async (orderId: string) => {
  const response = await fetch(`/api/orders/${orderId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch order');
  }
  return response.json();
};

const updateOrder = async ({ id, ...data }: any) => {
  const response = await fetch(`/api/orders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update order');
  }
  
  return response.json();
};

const deleteOrder = async (orderId: string) => {
  const response = await fetch(`/api/orders/${orderId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete order');
  }
  
  return response.json();
};

// Get all orders with filters
export const useGetOrders = (
  params?: {
    status?: string;
    from?: string;
    to?: string;
    q?: string;
    page?: number;
    limit?: number;
  }
) => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['orders', params],
    queryFn: () => getOrders(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    orders: data?.data?.orders || [],
    pagination: data?.data?.pagination,
    error,
    isLoading,
    refetch,
  };
};

// Get order by ID
export const useGetOrderById = (orderId: string) => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    order: data?.data?.order,
    error,
    isLoading,
    refetch,
  };
};

// Create order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  const onSuccess = (data: IAPISuccess) => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    openToast(
      'success',
      data?.response?.data?.message ||
        data?.response?.message ||
        data?.message ||
        'Order created successfully',
    );
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        'Failed to create order',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['createOrder'],
    mutationFn: createOrder,
    onSuccess,
    onError,
  });

  return {
    createOrder: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

// Update order
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  const onSuccess = (data: IAPISuccess) => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['order'] });
    openToast(
      'success',
      data?.response?.data?.message ||
        data?.response?.message ||
        data?.message ||
        'Order updated successfully',
    );
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        'Failed to update order',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['updateOrder'],
    mutationFn: updateOrder,
    onSuccess,
    onError,
  });

  return {
    updateOrder: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

// Delete order
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  const onSuccess = (data: IAPISuccess) => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    openToast(
      'success',
      data?.response?.data?.message ||
        data?.response?.message ||
        data?.message ||
        'Order deleted successfully',
    );
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        'Failed to delete order',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['deleteOrder'],
    mutationFn: deleteOrder,
    onSuccess,
    onError,
  });

  return {
    deleteOrder: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};
