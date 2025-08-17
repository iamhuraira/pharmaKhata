import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import jwt from 'jsonwebtoken';
import { env } from '@/config/envConfig';
import { getToken } from '@/utils/token';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Connect to database
      await connectDB();

      // Get token from cookie or authorization header
      const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '') || getToken();

      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'No token provided' 
        });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, env.JWT_SECRET_KEY as string) as any;
      
      if (!decoded || !decoded.userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token' 
        });
      }

      // Get user from database
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({ 
          success: false, 
          message: 'Account is not active' 
        });
      }

      // Return user data without password
      const userResponse = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role, // Just return the role ID
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
        message: 'User data retrieved successfully',
        user: userResponse
      });

    } catch (error) {
      console.error('Get me error:', error);
      
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token' 
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  } else if (req.method === 'PUT') {
    try {
      // Connect to database
      await connectDB();

      // Get token from cookie or authorization header
      const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '') || getToken();

      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'No token provided' 
        });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, env.JWT_SECRET_KEY as string) as any;
      
      if (!decoded || !decoded.userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token' 
        });
      }

      // Get user from database
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({ 
          success: false, 
          message: 'Account is not active' 
        });
      }

      // Update user fields (excluding sensitive ones)
      const updateData = { ...req.body };
      delete updateData.password;
      delete updateData.role;
      delete updateData.status;

      const updatedUser = await User.findByIdAndUpdate(
        decoded.userId, 
        updateData, 
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to update user' 
        });
      }

      // Return updated user data without password
      const userResponse = {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role, // Just return the role ID
        status: updatedUser.status,
        phone: updatedUser.phone,
        address: updatedUser.address,
        profilePicture: updatedUser.profilePicture,
        TFAEnabled: updatedUser.TFAEnabled,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user: userResponse
      });

    } catch (error) {
      console.error('Update me error:', error);
      
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token' 
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
