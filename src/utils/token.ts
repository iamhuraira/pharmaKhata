import Cookies from 'js-cookie';

export const getToken = (): string | null => {
  return Cookies.get('token') || null;
};

export const setToken = (token: string) => Cookies.set('token', token);

export const removeToken = () => Cookies.remove('token');
