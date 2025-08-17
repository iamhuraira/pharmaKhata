import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@/config/envConfig';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Phone and password are required' 
      }, { status: 400 });
    }

    // Find user by phone number
    console.log('Looking for user with phone:', phone);
    const user = await User.findOne({ 
      phone: phone
    });

    if (!user) {
      console.log('User not found for phone:', phone);
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 401 });
    }

    console.log('User found:', {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      status: user.status,
      passwordHash: user.password ? user.password.substring(0, 20) + '...' : 'no password'
    });

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json({ 
        success: false, 
        message: 'Account is not active' 
      }, { status: 401 });
    }

    // Verify password
    console.log('Verifying password...');
    console.log('Input password:', password);
    console.log('Stored hash starts with:', user.password ? user.password.substring(0, 10) : 'no hash');
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password verification result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Password verification failed');
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid credentials' 
      }, { status: 401 });
    }

    console.log('Password verification successful');

    // Generate JWT token
    const signOptions: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as any };
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role 
      },
      env.JWT_SECRET_KEY as string,
      signOptions
    );

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: (user.role as any)?.name || user.role,
        status: user.status,
        phone: user.phone,
        address: (user as any).currentAddress,
        profilePicture: user.profilePicture,
        TFAEnabled: user.TFAEnabled
      },
      token: token
    }, { status: 200 });

    // Set token in cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'lax'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
