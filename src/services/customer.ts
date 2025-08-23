import api from '@/utils/api';
import { TCreateCustomerService, TGetAllCustomersService } from '@/types/me';

export const createCustomer: TCreateCustomerService = async (payload) => {
  const { data } = await api.post(`/api/customers`, {
    ...payload,
  });
  return data;
};

export const getAllCustomers: TGetAllCustomersService = async () => {
  const { data } = await api.get(`/api/customers`);
  return data.data;
};

export const updateCustomer = async (payload: { id: string; [key: string]: any }) => {
  const { id, ...updateData } = payload;
  const { data } = await api.patch(`/api/customers/${id}`, updateData);
  return data;
};

export const deleteCustomer = async (id: string) => {
  const { data } = await api.delete(`/api/customers/${id}`);
  return data;
};

export const getCustomerById = async (id: string) => {
  const { data } = await api.get(`/api/customers/${id}`);
  return data.data;
};

export const recordPayment = async (payload: {
  customerId: string;
  type: 'payment' | 'advance';
  amount: number;
  method: string;
  date: string;
  reference?: string;
  note?: string;
  orderId?: string;
}) => {
  const { customerId, ...paymentData } = payload;
  const { data } = await api.post(`/api/customers/${customerId}/payments`, paymentData);
  return data;
};

export const getCustomerTransactions = async (id: string) => {
  const { data } = await api.get(`/api/customers/${id}/transactions`);
  return data.data;
};
