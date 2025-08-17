import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectDB();

    // Get all active users
    const users = await User.find({ status: 'active' })
      .populate('role')
      .select('-password -emailVerificationOTP -phoneVerificationOTP -forgotPasswordOTP -accessToken -TFAOTP')
      .sort({ createdAt: -1 });

    // Transform user data
    const usersResponse = users.map(user => ({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      phone: user.phone,
      address: user.address,
      profilePicture: user.profilePicture,
      TFAEnabled: user.TFAEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      users: usersResponse,
      total: usersResponse.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
