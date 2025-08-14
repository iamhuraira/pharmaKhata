import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@/config/envConfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectDB();

    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone and password are required' 
      });
    }

    // Find user by phone number
    console.log('Looking for user with phone:', phone);
    const user = await User.findOne({ 
      phone: phone
    });

    if (!user) {
      console.log('User not found for phone:', phone);
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
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
      return res.status(401).json({ 
        success: false, 
        message: 'Account is not active' 
      });
    }

    // Verify password
    console.log('Verifying password...');
    console.log('Input password:', password);
    console.log('Stored hash starts with:', user.password ? user.password.substring(0, 10) : 'no hash');
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password verification result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Password verification failed');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
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

    // Set token in cookie
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax`);

    // Return user data (without password)
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: (user.role as any)?.name || user.role, // Use role name if populated, otherwise ObjectId
      status: user.status,
      phone: user.phone,
      address: (user as any).currentAddress, // Use currentAddress from model with type assertion
      profilePicture: user.profilePicture,
      TFAEnabled: user.TFAEnabled
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token: token
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
