import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';
import { hashPassword } from '@/lib/utils/auth';
import { UserRoles } from '@/lib/constants/enums';

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

    const { firstName, lastName, email, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone: email }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email/phone already exists'
      });
    }

    // Get default user role
    const defaultRole = await Role.findOne({ name: UserRoles.USER });
    if (!defaultRole) {
      return res.status(500).json({
        success: false,
        message: 'Default user role not found'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone: email, // Using email as phone for now
      password: hashedPassword,
      role: defaultRole._id,
      status: 'active',
      phoneVerified: false,
      TFAEnabled: false,
      currentAddress: {
        street: '',
        city: '',
        state: '',
        country: ''
      }
    });

    await newUser.save();

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: defaultRole.name
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
