'use client';

import { useState, useEffect } from 'react';
import { Input, Alert, List, Typography, Spin } from 'antd';
import { PhoneOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { usePhoneValidation } from '@/hooks/usePhoneValidation';

const { Text } = Typography;

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onValidationChange?: (isValid: boolean, message?: string) => void;
  excludeUserId?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
}

export default function PhoneInput({
  value = '',
  onChange,
  onValidationChange,
  excludeUserId,
  placeholder = 'Enter phone number (03xxxxxxxxx)',
  disabled = false,
  className = '',
  allowClear = true
}: PhoneInputProps) {
  const [phone, setPhone] = useState(value);
  const [showValidation, setShowValidation] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  
  const { validatePhone, isValidating, error } = usePhoneValidation();

  // Update local state when value prop changes
  useEffect(() => {
    setPhone(value);
  }, [value]);

  // Validate phone number with debounce
  useEffect(() => {
    if (!phone || phone.length < 11) {
      setShowValidation(false);
      setValidationResult(null);
      onValidationChange?.(false);
      return;
    }

    // Check format first
    if (!isValidFormat(phone)) {
      const result = {
        isValid: false,
        message: 'Phone number must be 11 digits starting with 03'
      };
      setValidationResult(result);
      setShowValidation(true);
      onValidationChange?.(false, result.message);
      return;
    }

    // If format is valid, check uniqueness with debounce
    const timeoutId = setTimeout(async () => {
      const result = await validatePhone(phone, excludeUserId);
      setValidationResult(result);
      setShowValidation(true);
      onValidationChange?.(result.isValid, result.message);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [phone, excludeUserId, validatePhone, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const formattedValue = formatPhoneNumber(newValue);
    setPhone(formattedValue);
    onChange?.(formattedValue);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 11 digits
    if (digits.length > 11) {
      return digits.slice(0, 11);
    }
    
    return digits;
  };

  const isValidFormat = (phone: string) => {
    return phone.length === 11 && phone.startsWith('03');
  };

  const getInputStatus = (): '' | 'error' | 'warning' | undefined => {
    if (isValidating) return undefined;
    if (!showValidation) return undefined;
    if (validationResult?.isValid) return undefined; // Success doesn't have a status in Antd
    if (validationResult && !validationResult.isValid) return 'error';
    return undefined;
  };

  const getSuffix = () => {
    if (isValidating) {
      return <Spin size="small" />;
    }
    if (showValidation && validationResult) {
      if (validationResult.isValid) {
        return <CheckCircleOutlined className="text-green-500" />;
      } else {
        return <CloseCircleOutlined className="text-red-500" />;
      }
    }
    return <PhoneOutlined className="text-gray-400" />;
  };

  return (
    <div className={`phone-input ${className}`}>
      <Input
        value={phone}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        status={getInputStatus()}
        suffix={getSuffix()}
        maxLength={11}
        className="w-full"
        addonBefore="+92"
        addonAfter={phone.length === 11 ? (isValidFormat(phone) ? '✓' : '✗') : ''}
        allowClear={allowClear}
        onClear={() => {
          setPhone('');
          onChange?.('');
          setShowValidation(false);
          setValidationResult(null);
          onValidationChange?.(false);
        }}
      />
      
      {/* Validation Messages */}
      {showValidation && validationResult && (
        <div className="mt-2">
          {validationResult.isValid ? (
            <Alert
              message="Phone number is available"
              type="success"
              showIcon
            />
          ) : (
            <div>
              <Alert
                message={validationResult.message}
                type="error"
                showIcon
              />
              
              {/* Similar Numbers Suggestions */}
              {validationResult.similarNumbers && validationResult.similarNumbers.length > 0 && (
                <div className="mt-2">
                  <Text type="secondary" className="text-sm">
                    Did you mean one of these?
                  </Text>
                  <List
                    size="small"
                    dataSource={validationResult.similarNumbers}
                    renderItem={(item: any) => (
                      <List.Item className="py-1">
                        <Text 
                          className="cursor-pointer hover:text-blue-500"
                          onClick={() => {
                            setPhone(item.phone);
                            onChange?.(item.phone);
                          }}
                        >
                          {item.name} - {item.phone}
                        </Text>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          className="mt-2"
        />
      )}
    </div>
  );
}
