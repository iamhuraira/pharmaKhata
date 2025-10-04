import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IAPIError, IAPISuccess } from '@/types/api';
import { openToast } from '@/utils/toaster';
import { invalidateLedgerQueries } from './utils/invalidation';

// Mock API functions for now - these should be implemented in services
const getLedgerTransactions = async (params?: any) => {
  const queryString = new URLSearchParams();
  if (params?.month) queryString.append('month', params.month);
  if (params?.method) queryString.append('method', params.method);
  if (params?.type) queryString.append('type', params.type);
  if (params?.q) queryString.append('q', params.q);
  if (params?.page) queryString.append('page', params.page.toString());
  if (params?.limit) queryString.append('limit', params.limit.toString());

  const response = await fetch(`/api/cash/ledger?${queryString}`);
  if (!response.ok) {
    throw new Error('Failed to fetch ledger transactions');
  }
  return response.json();
};

const createLedgerTransaction = async (transactionData: any) => {
  const response = await fetch('/api/cash/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transactionData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create transaction');
  }
  
  return response.json();
};

const getLedgerTransactionById = async (transactionId: string) => {
  const response = await fetch(`/api/cash/transactions/${transactionId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch transaction');
  }
  return response.json();
};

const updateLedgerTransaction = async ({ id, ...data }: any) => {
  const response = await fetch(`/api/cash/transactions/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update transaction');
  }
  
  return response.json();
};

const deleteLedgerTransaction = async (transactionId: string) => {
  const response = await fetch(`/api/cash/transactions/${transactionId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete transaction');
  }
  
  return response.json();
};

const getMonthlySummary = async (month: string) => {
  const response = await fetch(`/api/reports/monthly-summary?month=${month}`);
  if (!response.ok) {
    throw new Error('Failed to fetch monthly summary');
  }
  return response.json();
};

const getSalesPurchaseReport = async (month: string) => {
  const response = await fetch(`/api/reports/sales-purchase?month=${month}`);
  if (!response.ok) {
    throw new Error('Failed to fetch sales purchase report');
  }
  return response.json();
};

const getCommissionReport = async (month: string) => {
  const response = await fetch(`/api/commission?month=${month}`);
  if (!response.ok) {
    throw new Error('Failed to fetch commission report');
  }
  return response.json();
};

const exportReport = async (params: any) => {
  const queryString = new URLSearchParams();
  if (params?.month) queryString.append('month', params.month);
  if (params?.type) queryString.append('type', params.type);
  if (params?.format) queryString.append('format', params.format);

  const response = await fetch(`/api/reports/export?${queryString}`);
  if (!response.ok) {
    throw new Error('Failed to export report');
  }
  return response.json();
};

// Get ledger transactions with filters
export const useGetLedgerTransactions = (
  params?: {
    month?: string;
    method?: string;
    type?: string;
    q?: string;
    page?: number;
    limit?: number;
  }
) => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['ledgerTransactions', params],
    queryFn: () => getLedgerTransactions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    transactions: data?.data?.transactions || [],
    summary: data?.data,
    error,
    isLoading,
    refetch,
  };
};

// Get ledger transaction by ID
export const useGetLedgerTransactionById = (transactionId: string) => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['ledgerTransaction', transactionId],
    queryFn: () => getLedgerTransactionById(transactionId),
    enabled: !!transactionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    transaction: data?.data?.transaction,
    error,
    isLoading,
    refetch,
  };
};

// Create ledger transaction
export const useCreateLedgerTransaction = () => {
  const queryClient = useQueryClient();

  const onSuccess = (data: IAPISuccess) => {
    invalidateLedgerQueries(queryClient, data?.response?.data?.transaction?.id);
    openToast(
      'success',
      data?.response?.data?.message ||
        data?.response?.message ||
        data?.message ||
        'Transaction created successfully',
    );
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        'Failed to create transaction',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['createLedgerTransaction'],
    mutationFn: createLedgerTransaction,
    onSuccess,
    onError,
  });

  return {
    createLedgerTransaction: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

// Update ledger transaction
export const useUpdateLedgerTransaction = () => {
  const queryClient = useQueryClient();

  const onSuccess = (data: IAPISuccess) => {
    invalidateLedgerQueries(queryClient, data?.response?.data?.transaction?.id);
    openToast(
      'success',
      data?.response?.data?.message ||
        data?.response?.message ||
        data?.message ||
        'Transaction updated successfully',
    );
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        'Failed to update transaction',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['updateLedgerTransaction'],
    mutationFn: updateLedgerTransaction,
    onSuccess,
    onError,
  });

  return {
    updateLedgerTransaction: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

// Delete ledger transaction
export const useDeleteLedgerTransaction = () => {
  const queryClient = useQueryClient();

  const onSuccess = (data: IAPISuccess) => {
    invalidateLedgerQueries(queryClient);
    openToast(
      'success',
      data?.response?.data?.message ||
        data?.response?.message ||
        data?.message ||
        'Transaction deleted successfully',
    );
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        'Failed to delete transaction',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['deleteLedgerTransaction'],
    mutationFn: deleteLedgerTransaction,
    onSuccess,
    onError,
  });

  return {
    deleteLedgerTransaction: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};

// Get monthly summary
export const useGetMonthlySummary = (month: string) => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['monthlySummary', month],
    queryFn: () => getMonthlySummary(month),
    enabled: !!month,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    summary: data?.data,
    error,
    isLoading,
    refetch,
  };
};

// Get sales purchase report
export const useGetSalesPurchaseReport = (month: string) => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['salesPurchaseReport', month],
    queryFn: () => getSalesPurchaseReport(month),
    enabled: !!month,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    report: data?.data,
    error,
    isLoading,
    refetch,
  };
};

// Get commission report
export const useGetCommissionReport = (month: string) => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['commissionReport', month],
    queryFn: () => getCommissionReport(month),
    enabled: !!month,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    report: data?.data,
    error,
    isLoading,
    refetch,
  };
};

// Export report
export const useExportReport = () => {
  const onSuccess = (data: IAPISuccess) => {
    openToast(
      'success',
      data?.response?.data?.message ||
        data?.response?.message ||
        data?.message ||
        'Report exported successfully',
    );
  };

  const onError = (error: IAPIError) => {
    openToast(
      'error',
      error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        'Failed to export report',
    );
  };

  const { mutateAsync, error, isError, isPending, isSuccess } = useMutation({
    mutationKey: ['exportReport'],
    mutationFn: exportReport,
    onSuccess,
    onError,
  });

  return {
    exportReport: mutateAsync,
    error,
    isError,
    isLoading: isPending,
    isSuccess,
  };
};
