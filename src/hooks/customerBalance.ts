import { useQuery } from '@tanstack/react-query';

// Fetch customer balance by ID
const getCustomerBalance = async (customerId: string) => {
  const response = await fetch(`/api/customers/balance?customerId=${customerId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch customer balance');
  }
  return response.json();
};

// Fetch all customer balances
const getAllCustomerBalances = async () => {
  const response = await fetch('/api/customers/balance');
  if (!response.ok) {
    throw new Error('Failed to fetch customer balances');
  }
  return response.json();
};

// Hook for getting a specific customer's balance
export const useGetCustomerBalance = (customerId: string) => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['customerBalance', customerId],
    queryFn: () => getCustomerBalance(customerId),
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    balance: data?.data?.balance || 0,
    totalDebits: data?.data?.totalDebits || 0,
    totalCredits: data?.data?.totalCredits || 0,
    orderBasedBalance: data?.data?.orderBasedBalance || 0,
    transactionCount: data?.data?.transactionCount || 0,
    orderCount: data?.data?.orderCount || 0,
    transactions: data?.data?.transactions || [],
    orders: data?.data?.orders || [],
    error,
    isLoading,
    refetch,
  };
};

// Hook for getting all customer balances
export const useGetAllCustomerBalances = () => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['allCustomerBalances'],
    queryFn: getAllCustomerBalances,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    customerBalances: data?.data?.customerBalances || [],
    totalCustomers: data?.data?.totalCustomers || 0,
    error,
    isLoading,
    refetch,
  };
};
