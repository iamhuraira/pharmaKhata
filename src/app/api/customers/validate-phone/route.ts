import { NextRequest, NextResponse } from 'next/server';
import { validateCustomerPhone, getSimilarPhoneNumbers } from '@/lib/utils/phoneValidation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, excludeUserId } = body;

    if (!phone) {
      return NextResponse.json({
        success: false,
        message: 'Phone number is required'
      }, { status: 400 });
    }

    // Validate phone number
    const validation = await validateCustomerPhone(phone, excludeUserId);
    
    if (validation.isValid) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: true,
          message: 'Phone number is available'
        }
      });
    } else {
      // Get similar phone numbers for suggestions
      const similarNumbers = await getSimilarPhoneNumbers(phone);
      
      return NextResponse.json({
        success: false,
        data: {
          isValid: false,
          message: validation.message,
          similarNumbers
        }
      });
    }

  } catch (error) {
    console.error('Phone validation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error validating phone number'
    }, { status: 500 });
  }
}
