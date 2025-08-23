import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    const emailVerified = Cookies.get('emailVerified');
    
    if (token && emailVerified === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      // If no valid token, redirect to sign-in
      if (window.location.pathname.startsWith('/dashboard')) {
        router.push('/sign-in');
      }
    }
    
    setIsLoading(false);
  }, [router]);

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('emailVerified');
    localStorage.clear();
    setIsAuthenticated(false);
    router.push('/sign-in');
  };

  return {
    isAuthenticated,
    isLoading,
    logout
  };
};
