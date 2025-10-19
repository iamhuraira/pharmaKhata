import type {
  TGetProfileService,
  TUpdateProfileService,
} from '@/types/profile';
import api from '@/utils/api';

export const getProfile: TGetProfileService = async () => {
  console.log('🔍 getProfile: Starting API call');
  const { data } = await api.get('/api/profile');
  console.log('🔍 getProfile: API response:', data);
  console.log('🔍 getProfile: User data:', data.data?.user);
  return data;
};

export const updateProfile: TUpdateProfileService = async (payload) => {
  const { data } = await api.put('/api/profile', payload);
  return data;
};
