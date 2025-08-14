import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  try {
    // Connect to database
    await connectDB();

    if (req.method === 'GET') {
      const user = await User.findById(id).populate('role');
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Return user data without password
      const userResponse = {
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
      };

      return res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        user: userResponse
      });

    } else if (req.method === 'PUT') {
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Update user fields (excluding sensitive ones)
      const updateData = { ...req.body };
      delete updateData.password;
      delete updateData.role;

      const updatedUser = await User.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      ).populate('role');

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user: updatedUser
      });

    } else if (req.method === 'DELETE') {
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Soft delete - mark as deleted instead of removing
      await User.findByIdAndUpdate(id, { status: 'deleted' });

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });

    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('User API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
