import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IAPIError, IAPISuccess } from '@/types/api';
import { openToast } from '@/utils/toaster';

// Mock API functions for now - these should be implemented in services
const getAllCustomers = async (params?: any) => {
  const queryString = new URLSearchParams();
  if (params?.q) queryString.append('q', params.q);
  if (params?.page) queryString.append('page', params.page.toString());
  if (params?.limit) queryString.append('limit', params.limit.toString());

  const response = await fetch(`/api/customers?${queryString}`);
  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }
  return response.json();
};

const getCustomerById = async (customerId: string) => {
  const response = await fetch(`/api/customers/${customerId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch customer');
  }
  return response.json();
};

const getCustomerTransactions = async (customerId: string) => {
  const response = await fetch(`/api/customers/${customerId}/transactions`);
  if (!response.ok) {
    throw new Error('Failed to fetch customer transactions');
  }
  return response.json();
};

const createCustomer = async (customerData: any) => {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customerData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create customer');
  }
  
  return response.json();
};

const updateCustomer = async ({ id, ...data }: any) => {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update customer');
  }
  
  return response.json();
};

const deleteCustomer = async (customerId: string) => {
  const response = await fetch(`/api/customers/${customerId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete customer');
  }
  
  return response.json();
};

const recordPayment = async (paymentData: any) => {
  const response = await fetch(`/api/customers/${paymentData.customerId}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to record payment');
  }
  
  return response.json();
};

// Get all customers with filters
export const useGetAllCustomers = (params?: {
  q?: string;
  page?: number;
  limit?: number;
}) => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['customers', params],
    queryFn: () => getAllCustomers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    customers: data?.data?.customers || [],
    pagination: data?.data?.pagination,
    error,
    isLoading,
    refetch,
  };
};

// Get customer by ID
export const useGetCustomerById = (customerId: string) => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => getCustomerById(customerId),
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    customer: data?.data?.customer,
    error,
    isLoading,
    refetch,
  };
};

// Get customer transactions
export const useGetCustomerTransactions = (customerId: string) => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['customerTransactions', customerId],
    queryFn: () => getCustomerTransactions(customerId),
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    transactions: data?.data?.transactions || [],
    summary: data?.data?.summary,
    error,
    isLoading,
    refetch,
  };
};

// Create customer
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  const onSuccess = (data: IAPISuccess) => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    openToast(
      'success',
      data?.response?.data?.message ||
        data?.response?.message ||
        data?.message ||
        'Customer created successfully',
    );
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        'Failed to create customer',
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

// Update customer
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  const onSuccess = (data: IAPISuccess) => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['customer'] });
    openToast(
      'success',
      data?.response?.data?.message ||
        data?.response?.message ||
        data?.message ||
        'Customer updated successfully',
    );
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        'Failed to update customer',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['updateCustomer'],
    mutationFn: updateCustomer,
    onSuccess,
    onError,
  });

  return {
    updateCustomer: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

// Delete customer
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  const onSuccess = (data: IAPISuccess) => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    openToast(
      'success',
      data?.response?.data?.message ||
        data?.response?.message ||
        data?.message ||
        'Customer deleted successfully',
    );
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        'Failed to delete customer',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['deleteCustomer'],
    mutationFn: deleteCustomer,
    onSuccess,
    onError,
  });

  return {
    deleteCustomer: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

// Record customer payment
export const useRecordPayment = () => {
  const queryClient = useQueryClient();

  const onSuccess = (data: IAPISuccess) => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['customerTransactions'] });
    openToast(
      'success',
      data?.response?.data?.message ||
        data?.response?.message ||
        data?.message ||
        'Payment recorded successfully',
    );
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        'Failed to record payment',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['recordPayment'],
    mutationFn: recordPayment,
    onSuccess,
    onError,
  });

  return {
    recordPayment: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};
