import axios from 'axios';
import { getToken, removeToken } from './token';

const api = axios.create({
  baseURL: '', // Use relative URLs for Next.js API routes
});

// Intercept requests to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    // If the request is successful, simply return the response
    return response;
  },
  (error: {
    response: {
      status: number;
    };
  }) => {
    if (error?.response?.status === 401) {
      localStorage.clear();
      removeToken();
      window.location.href = '/sign-in';
    }

    return Promise.reject(error);
  },
);

export default api;
