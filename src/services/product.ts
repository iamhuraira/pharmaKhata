import api from '@/utils/api';
import { TGetAllProductService, TUpdateProductQuantityService } from '@/types/products';

export const getAllProducts: TGetAllProductService = async () => {
  const { data } = await api.get('/api/products?limit=40');

  console.log(data);
  return data.data;
};

export const updateProductQuantity: TUpdateProductQuantityService = async (playload) => {
  const { data } = await api.put(`/api/products/manage/${playload.productId}`, {
    quantity: playload.quantity,
  });

  return data;
};
