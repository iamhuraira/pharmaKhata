import type {
  TGetProfileService,
  TUpdateProfileService,
} from '@/types/profile';
import api from '@/utils/api';

export const getProfile: TGetProfileService = async () => {
  const { data } = await api.get('/api/profile');
  return data;
};

export const updateProfile: TUpdateProfileService = async (payload) => {
  const { data } = await api.put('/api/profile', payload);
  return data;
};
