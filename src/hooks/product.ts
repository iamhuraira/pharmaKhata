import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Mock API functions (replace with actual API calls)
const getProducts = async (params?: { q?: string; categoryId?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.q) queryParams.append('q', params.q);
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);

  const response = await fetch(`/api/products?${queryParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
};

const createProduct = async (productData: any) => {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    throw new Error('Failed to create product');
  }
  return response.json();
};

const updateProduct = async ({ id, data }: { id: string; data: any }) => {
  const response = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update product');
  }
  return response.json();
};

const deleteProduct = async (id: string) => {
  const response = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete product');
  }
  return response.json();
};

// Hooks
export const useGetProducts = (params?: { q?: string; categoryId?: string }) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
    select: (data) => data?.data?.products || [],
  });
};

export const useGetProductById = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      return response.json();
    },
    select: (data) => data?.data?.product,
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
