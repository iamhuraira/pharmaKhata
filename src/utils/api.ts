import axios from 'axios';
import { getToken } from './token';

const api = axios.create({
  baseURL: '', // Use relative URLs for Next.js API routes
});

// Intercept requests to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // Don't automatically redirect on 401 - let the components handle it
    // This prevents infinite loops and allows proper error handling
    return Promise.reject(error);
  },
);

export default api;
