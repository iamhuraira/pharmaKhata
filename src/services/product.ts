import api from '@/utils/api';
import { TGetAllProductService, TUpdateProductQuantityService } from '@/types/products';

export const getAllProducts: TGetAllProductService = async () => {
  const { data } = await api.get('/products');

  return data;
};

export const updateProductQuantity: TUpdateProductQuantityService = async (playload) => {
  const { data } = await api.put(`/products/update-product-quantity/${playload.productId}`, {
    quantity: playload.quantity,
  });

  return data;
};
