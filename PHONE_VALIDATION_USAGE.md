# Phone Number Validation for Customers

## Overview

The enhanced phone validation system ensures that customer phone numbers are unique and properly formatted. This prevents duplicate customers and maintains data integrity.

## Features

### 1. **Real-time Validation**
- Validates phone number format (11 digits starting with 03)
- Checks uniqueness against existing customers
- Provides instant feedback with visual indicators

### 2. **Smart Suggestions**
- Shows similar phone numbers when duplicates are found
- Allows quick selection from suggestions
- Helps prevent typos and duplicates

### 3. **User-friendly Interface**
- Visual success/error indicators
- Clear error messages
- Debounced validation to avoid excessive API calls

## Usage Examples

### Basic PhoneInput Component

```tsx
import PhoneInput from '@/components/customer-management/PhoneInput';

function CustomerForm() {
  const [phone, setPhone] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  return (
    <PhoneInput
      value={phone}
      onChange={setPhone}
      onValidationChange={(isValid, message) => {
        setIsPhoneValid(isValid);
        console.log('Phone validation:', isValid, message);
      }}
      placeholder="Enter customer phone number"
    />
  );
}
```

### With Customer Update (Exclude Current Customer)

```tsx
function EditCustomerForm({ customerId, currentPhone }) {
  const [phone, setPhone] = useState(currentPhone);

  return (
    <PhoneInput
      value={phone}
      onChange={setPhone}
      excludeUserId={customerId} // Exclude current customer from validation
      placeholder="Update phone number"
    />
  );
}
```

### With Form Validation

```tsx
import { Form, Button } from 'antd';
import PhoneInput from '@/components/customer-management/PhoneInput';

function CustomerForm() {
  const [form] = Form.useForm();
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  const handleSubmit = (values) => {
    if (!isPhoneValid) {
      message.error('Please enter a valid phone number');
      return;
    }
    // Submit form
  };

  return (
    <Form form={form} onFinish={handleSubmit}>
      <Form.Item
        name="phone"
        rules={[
          { required: true, message: 'Phone number is required' },
          { 
            validator: (_, value) => {
              if (!isPhoneValid) {
                return Promise.reject(new Error('Phone number is invalid or already exists'));
              }
              return Promise.resolve();
            }
          }
        ]}
      >
        <PhoneInput
          onValidationChange={setIsPhoneValid}
        />
      </Form.Item>
      
      <Button 
        type="primary" 
        htmlType="submit"
        disabled={!isPhoneValid}
      >
        Create Customer
      </Button>
    </Form>
  );
}
```

## API Endpoints

### Validate Phone Number

```typescript
POST /api/customers/validate-phone
{
  "phone": "03001234567",
  "excludeUserId": "optional-customer-id"
}

// Response
{
  "success": true,
  "data": {
    "isValid": true,
    "message": "Phone number is available"
  }
}

// Or if invalid
{
  "success": false,
  "data": {
    "isValid": false,
    "message": "Phone number already exists for another customer",
    "similarNumbers": [
      { "id": "123", "name": "John Doe", "phone": "03001234568" }
    ]
  }
}
```

## Validation Rules

### 1. **Format Validation**
- Must be exactly 11 digits
- Must start with "03" (Pakistani mobile format)
- Only numeric characters allowed

### 2. **Uniqueness Validation**
- Must be unique among all active customers
- Excludes inactive/deleted customers
- Excludes current customer when updating

### 3. **Real-time Feedback**
- Format validation happens immediately
- Uniqueness validation with 500ms debounce
- Visual indicators for validation state

## Component Props

```typescript
interface PhoneInputProps {
  value?: string;                    // Current phone value
  onChange?: (value: string) => void; // Callback when value changes
  onValidationChange?: (isValid: boolean, message?: string) => void; // Validation callback
  excludeUserId?: string;            // User ID to exclude from validation (for updates)
  placeholder?: string;              // Input placeholder
  disabled?: boolean;                // Disable input
  className?: string;                // Additional CSS classes
  allowClear?: boolean;              // Show clear button
}
```

## Integration with Existing Forms

### Yup Schema Integration

```typescript
const customerSchema = Yup.object().shape({
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^03\d{9}$/, 'Invalid phone number format. Must be 11 digits starting with 03')
    .test('phone-unique', 'Phone number already exists', async function(value) {
      if (!value) return true;
      
      const response = await fetch('/api/customers/validate-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: value,
          excludeUserId: this.parent?.id
        }),
      });
      
      const result = await response.json();
      return result.success;
    }),
});
```

## Error Handling

The component handles various error scenarios:

1. **Network Errors**: Shows generic error message
2. **Format Errors**: Immediate feedback for invalid format
3. **Duplicate Errors**: Shows error with similar number suggestions
4. **Validation Errors**: Clear error messages with context

## Best Practices

1. **Always use onValidationChange**: To track validation state in parent components
2. **Provide excludeUserId for updates**: To avoid false positives when editing
3. **Handle loading states**: Show appropriate feedback during validation
4. **Use debounced validation**: To avoid excessive API calls
5. **Provide clear error messages**: Help users understand what went wrong

This phone validation system ensures data integrity while providing a smooth user experience for customer management.
