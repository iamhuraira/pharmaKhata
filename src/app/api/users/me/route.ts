import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    User && Role;
    
    // Get token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'No token provided'
      }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // Check if JWT_SECRET is configured
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.warn('JWT_SECRET environment variable is not set');
        return NextResponse.json({
          success: false,
          message: 'Authentication not properly configured'
        }, { status: 500 });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Get user with role populated
      const user = await User.findById(decoded.userId)
        .populate('role')
        .select('-password')
        .lean();
      
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
            email: user.email,
            role: user.role,
            status: user.status,
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
    console.error('Get user me error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
