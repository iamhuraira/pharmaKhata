import Cookies from 'js-cookie';

export const getToken = (): string | null => {
  return Cookies.get('token_js') || null;
};

export const setToken = (token: string) => {
  Cookies.set('token_js', token);
};

export const removeToken = () => {
  Cookies.remove('token');
  Cookies.remove('token_js');
};
