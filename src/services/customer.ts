import api from '@/utils/api';
import { TCreateCustomerService, TGetAllCustomersService } from '@/types/me';

export const createCustomer: TCreateCustomerService = async (payload) => {
  const { data } = await api.post(`/api/customer`, {
    ...payload,
  });

  return data;
};

export const getAllCustomers: TGetAllCustomersService = async () => {
  const { data } = await api.get(`/api/customer`);

  return data;
};
