import { QueryClient } from '@tanstack/react-query';

// Centralized invalidation utility
export const invalidateAllRelatedQueries = (
  queryClient: QueryClient,
  options?: {
    customerId?: string;
    orderId?: string;
    productId?: string;
    transactionId?: string;
  }
) => {
  // Core data queries
  queryClient.invalidateQueries({ queryKey: ['customers'] });
  queryClient.invalidateQueries({ queryKey: ['orders'] });
  queryClient.invalidateQueries({ queryKey: ['products'] });
  queryClient.invalidateQueries({ queryKey: ['ledger'] });
  queryClient.invalidateQueries({ queryKey: ['ledgerTransactions'] });
  
  // Customer-related queries
  queryClient.invalidateQueries({ queryKey: ['customer'] });
  queryClient.invalidateQueries({ queryKey: ['customerTransactions'] });
  queryClient.invalidateQueries({ queryKey: ['customerBalance'] });
  queryClient.invalidateQueries({ queryKey: ['allCustomerBalances'] });
  
  // Order-related queries
  queryClient.invalidateQueries({ queryKey: ['order'] });
  
  // Product-related queries
  queryClient.invalidateQueries({ queryKey: ['product'] });
  
  // Ledger-related queries
  queryClient.invalidateQueries({ queryKey: ['ledgerTransaction'] });
  
  // Report queries
  queryClient.invalidateQueries({ queryKey: ['reports'] });
  queryClient.invalidateQueries({ queryKey: ['monthlySummary'] });
  queryClient.invalidateQueries({ queryKey: ['salesPurchaseReport'] });
  queryClient.invalidateQueries({ queryKey: ['commissionReport'] });
  
  // Stock/Inventory queries (if they exist)
  queryClient.invalidateQueries({ queryKey: ['stock'] });
  queryClient.invalidateQueries({ queryKey: ['inventory'] });
  queryClient.invalidateQueries({ queryKey: ['stockTransactions'] });
  
  // Specific entity queries
  if (options?.customerId) {
    queryClient.invalidateQueries({ 
      queryKey: ['customer', options.customerId] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['customerTransactions', options.customerId] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['customerBalance', options.customerId] 
    });
  }
  
  if (options?.orderId) {
    queryClient.invalidateQueries({ 
      queryKey: ['order', options.orderId] 
    });
  }
  
  if (options?.productId) {
    queryClient.invalidateQueries({ 
      queryKey: ['product', options.productId] 
    });
  }
  
  if (options?.transactionId) {
    queryClient.invalidateQueries({ 
      queryKey: ['ledgerTransaction', options.transactionId] 
    });
  }
};

// Specific invalidation patterns
export const invalidateCustomerQueries = (
  queryClient: QueryClient,
  customerId?: string
) => {
  invalidateAllRelatedQueries(queryClient, { customerId });
};

export const invalidateOrderQueries = (
  queryClient: QueryClient,
  orderId?: string,
  customerId?: string
) => {
  invalidateAllRelatedQueries(queryClient, { orderId, customerId });
};

export const invalidateProductQueries = (
  queryClient: QueryClient,
  productId?: string
) => {
  invalidateAllRelatedQueries(queryClient, { productId });
};

export const invalidateLedgerQueries = (
  queryClient: QueryClient,
  transactionId?: string
) => {
  invalidateAllRelatedQueries(queryClient, { transactionId });
};
