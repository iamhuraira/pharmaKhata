import { useState, useCallback } from 'react';

interface PhoneValidationResult {
  isValid: boolean;
  message?: string;
  similarNumbers?: Array<{id: string, name: string, phone: string}>;
}

interface UsePhoneValidationReturn {
  validatePhone: (phone: string, excludeUserId?: string) => Promise<PhoneValidationResult>;
  isValidating: boolean;
  error: string | null;
}

export const usePhoneValidation = (): UsePhoneValidationReturn => {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePhone = useCallback(async (
    phone: string, 
    excludeUserId?: string
  ): Promise<PhoneValidationResult> => {
    if (!phone) {
      return {
        isValid: false,
        message: 'Phone number is required'
      };
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch('/api/customers/validate-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phone.trim(),
          excludeUserId
        }),
      });

      const result = await response.json();

      if (result.success) {
        return {
          isValid: true,
          message: 'Phone number is available'
        };
      } else {
        return {
          isValid: false,
          message: result.data?.message || 'Phone number validation failed',
          similarNumbers: result.data?.similarNumbers || []
        };
      }
    } catch (err) {
      const errorMessage = 'Error validating phone number';
      setError(errorMessage);
      return {
        isValid: false,
        message: errorMessage
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  return {
    validatePhone,
    isValidating,
    error
  };
};
