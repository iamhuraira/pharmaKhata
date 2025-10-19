import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { validateCustomerPhone } from '@/lib/utils/phoneValidation';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get token from headers
    const authHeader = request.headers.get('authorization');
    console.log('🔍 Profile API Debug:', { 
      authHeader: authHeader ? authHeader.substring(0, 20) + '...' : null,
      hasAuthHeader: !!authHeader,
      startsWithBearer: authHeader?.startsWith('Bearer ')
    });
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ Profile API: No valid authorization header');
      return NextResponse.json({
        success: false,
        message: 'No token provided'
      }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // Check if JWT_SECRET_KEY is configured
      const jwtSecret = process.env.JWT_SECRET_KEY;
      if (!jwtSecret) {
        console.warn('JWT_SECRET_KEY environment variable is not set');
        return NextResponse.json({
          success: false,
          message: 'Authentication not properly configured'
        }, { status: 500 });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, jwtSecret) as any;
      console.log('🔍 Profile API: JWT decoded:', { 
        id: decoded.id, 
        role: decoded.role 
      });
      
      // Get user profile
      const user = await User.findById(decoded.id).select('-password');
      console.log('🔍 Profile API: User found:', { 
        userExists: !!user, 
        userId: user?._id 
      });
      
      if (!user) {
        return NextResponse.json({
          success: false,
          message: 'User not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            whatsappNumber: user.whatsappNumber,
            email: user.email,
            status: user.status,
            role: user.role,
            currentAddress: (user as any).currentAddress,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      });

    } catch (jwtError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 });
    }

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    // Get token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'No token provided'
      }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    let userId: string;
    try {
      // Check if JWT_SECRET_KEY is configured
      const jwtSecret = process.env.JWT_SECRET_KEY;
      if (!jwtSecret) {
        console.warn('JWT_SECRET_KEY environment variable is not set');
        return NextResponse.json({
          success: false,
          message: 'Authentication not properly configured'
        }, { status: 500 });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, jwtSecret) as any;
      userId = decoded.id;
    } catch (jwtError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      whatsappNumber,
      email,
      currentPassword,
      newPassword,
      confirmPassword,
      address
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !phone) {
      return NextResponse.json({
        success: false,
        message: 'First name, last name, and phone are required'
      }, { status: 400 });
    }

    // Get current user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Validate phone number uniqueness (exclude current user)
    const phoneValidation = await validateCustomerPhone(phone, userId);
    if (!phoneValidation.isValid) {
      return NextResponse.json({
        success: false,
        message: phoneValidation.message || 'Invalid phone number'
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      firstName,
      lastName,
      phone,
      whatsappNumber: whatsappNumber || undefined,
      email: email || undefined
    };

    // Handle address update
    if (address) {
      if (typeof address === 'string') {
        // Handle legacy string format
        const addressParts = address.split(',').map(part => part.trim());
        if (addressParts.length >= 3) {
          updateData.currentAddress = {
            street: addressParts[0] || '',
            city: addressParts[1] || '',
            state: addressParts[2] || '',
            country: addressParts[3] || 'Pakistan'
          };
        }
      } else if (typeof address === 'object' && address !== null) {
        // Handle structured address object
        updateData.currentAddress = {
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          country: address.country || 'Pakistan'
        };
      }
    }

    // Handle password update
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({
          success: false,
          message: 'Current password is required to change password'
        }, { status: 400 });
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json({
          success: false,
          message: 'New password and confirm password do not match'
        }, { status: 400 });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({
          success: false,
          message: 'Current password is incorrect'
        }, { status: 400 });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      updateData.password = hashedNewPassword;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    console.log(`🔍 User ${userId} profile updated successfully`);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser!._id,
          firstName: updatedUser!.firstName,
          lastName: updatedUser!.lastName,
          phone: updatedUser!.phone,
          whatsappNumber: updatedUser!.whatsappNumber,
          email: updatedUser!.email,
          status: updatedUser!.status,
          role: updatedUser!.role,
          currentAddress: (updatedUser as any)!.currentAddress,
          updatedAt: updatedUser!.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
