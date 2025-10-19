import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';

/**
 * Validates if a phone number is unique for customers
 * @param phone - The phone number to validate
 * @param excludeUserId - Optional user ID to exclude from validation (for updates)
 * @returns Promise<boolean> - true if phone is unique, false if it exists
 */
export async function isPhoneUniqueForCustomers(
  phone: string, 
  excludeUserId?: string
): Promise<boolean> {
  try {
    await connectDB();

    // Get customer role
    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
      throw new Error('Customer role not found');
    }

    // Build query to find existing customer with same phone
    const query: any = {
      phone: phone,
      role: customerRole._id,
      status: { $ne: 'inactive' } // Exclude inactive customers
    };

    // Exclude current user if updating
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }

    const existingCustomer = await User.findOne(query);
    
    return !existingCustomer; // Return true if no customer found (unique)

  } catch (error) {
    console.error('Error validating phone uniqueness:', error);
    return false; // Return false on error to be safe
  }
}

/**
 * Validates phone number format and uniqueness for customers
 * @param phone - The phone number to validate
 * @param excludeUserId - Optional user ID to exclude from validation (for updates)
 * @returns Promise<{isValid: boolean, message?: string}>
 */
export async function validateCustomerPhone(
  phone: string, 
  excludeUserId?: string
): Promise<{isValid: boolean, message?: string}> {
  try {
    // Validate phone format
    if (!phone) {
      return { isValid: false, message: 'Phone number is required' };
    }

    // Check phone format (Pakistani mobile number format)
    const phoneRegex = /^03\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return { 
        isValid: false, 
        message: 'Invalid phone number format. Must be 11 digits starting with 03' 
      };
    }

    // Check uniqueness
    const isUnique = await isPhoneUniqueForCustomers(phone, excludeUserId);
    if (!isUnique) {
      return { 
        isValid: false, 
        message: 'Phone number already exists for another customer' 
      };
    }

    return { isValid: true };

  } catch (error) {
    console.error('Error validating customer phone:', error);
    return { 
      isValid: false, 
      message: 'Error validating phone number' 
    };
  }
}

/**
 * Get all customers with similar phone numbers (for suggestions)
 * @param phone - The phone number to search for similar ones
 * @param limit - Maximum number of results to return
 * @returns Promise<Array> - Array of customers with similar phone numbers
 */
export async function getSimilarPhoneNumbers(
  phone: string, 
  limit: number = 5
): Promise<Array<{id: string, name: string, phone: string}>> {
  try {
    await connectDB();

    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
      return [];
    }

    // Search for customers with similar phone numbers
    const customers = await User.find({
      phone: { $regex: phone, $options: 'i' },
      role: customerRole._id,
      status: { $ne: 'inactive' }
    })
    .select('firstName lastName phone')
    .limit(limit)
    .lean();

    return customers.map(customer => ({
      id: customer._id.toString(),
      name: `${customer.firstName} ${customer.lastName}`,
      phone: customer.phone
    }));

  } catch (error) {
    console.error('Error getting similar phone numbers:', error);
    return [];
  }
}
