import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    console.log('🔍 Test API - Fetching user with ID:', userId);
    
    // Fetch user directly without role filtering
    const user = await User.findById(userId).lean();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    console.log('🔍 Test API - Raw user from DB:', user);
    console.log('🔍 Test API - User keys:', Object.keys(user));
    console.log('🔍 Test API - currentAddress field:', (user as any).currentAddress);
    console.log('🔍 Test API - currentAddress type:', typeof (user as any).currentAddress);
    
    if ((user as any).currentAddress) {
      console.log('🔍 Test API - currentAddress keys:', Object.keys((user as any).currentAddress));
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
          balance: user.balance,
          currentAddress: (user as any).currentAddress,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
