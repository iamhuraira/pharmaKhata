import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    User && Role;
    
    // Get customer role
    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
      return NextResponse.json({
        success: false,
        message: 'Customer role not found'
      }, { status: 404 });
    }

    // Get all customers with their balance field
    const customers = await (User as any).find({ role: customerRole._id })
      .select('firstName lastName phone balance createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get total count
    const totalCustomers = await (User as any).countDocuments({ role: customerRole._id });

    // Calculate balance statistics
    const balanceStats = customers.reduce((stats: any, customer: any) => {
      const balance = customer.balance || 0;
      
      if (balance > 0) {
        stats.advanceCustomers++;
        stats.totalAdvance += balance;
      } else if (balance < 0) {
        stats.owingCustomers++;
        stats.totalOwed += Math.abs(balance);
      } else {
        stats.balancedCustomers++;
      }
      
      return stats;
    }, {
      advanceCustomers: 0,
      owingCustomers: 0,
      balancedCustomers: 0,
      totalAdvance: 0,
      totalOwed: 0
    });

    return NextResponse.json({
      success: true,
      message: 'Balance field test successful',
      data: {
        totalCustomers,
        customers: customers.map((customer: any) => ({
          id: customer._id,
          name: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone,
          balance: customer.balance || 0,
          balanceStatus: customer.balance > 0 ? 'advance' : customer.balance < 0 ? 'owing' : 'balanced',
          formattedBalance: `${customer.balance >= 0 ? '+' : ''}${customer.balance} PKR`,
          createdAt: customer.createdAt
        })),
        balanceStats,
        summary: {
          message: `Found ${totalCustomers} customers. ${balanceStats.advanceCustomers} have advance, ${balanceStats.owingCustomers} owe money, ${balanceStats.balancedCustomers} are balanced.`,
          totalAdvance: balanceStats.totalAdvance,
          totalOwed: balanceStats.totalOwed,
          netPosition: balanceStats.totalAdvance - balanceStats.totalOwed
        }
      }
    });

  } catch (error) {
    console.error('Balance field test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
