import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';
import { Order } from '@/lib/models/order';
import { getCustomerBalanceSummary } from '@/lib/utils/customerBalance';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    User && Role && Order;
    
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
    if (customerId) {
      // Get balance for specific customer
      return await getCustomerBalance(customerId);
    } else {
      // Get balances for all customers
      return await getAllCustomerBalances();
    }
    
  } catch (error) {
    console.error('Get customer balance error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

async function getCustomerBalance(customerId: string) {
  try {
    // Validate customer exists
    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
      return NextResponse.json({
        success: false,
        message: 'Customer role not found'
      }, { status: 404 });
    }

    const customer = await User.findOne({ 
      _id: customerId, 
      role: customerRole._id 
    });
    
    if (!customer) {
      return NextResponse.json({
        success: false,
        message: 'Customer not found'
      }, { status: 404 });
    }

    // Get customer balance using utility function
    const balanceSummary = await getCustomerBalanceSummary(customerId);

    // Get customer orders for additional context
    const orders = await (Order as any).find({
      'customer.id': customerId
    })
    .sort({ createdAt: -1 })
    .lean();

    console.log(`🔍 Customer ${customer.firstName} ${customer.lastName}:`);
    console.log(`  - Balance: ${balanceSummary.formattedBalance}`);
    console.log(`  - Status: ${balanceSummary.status}`);
    console.log(`  - Message: ${balanceSummary.message}`);

    return NextResponse.json({
      success: true,
      data: {
        customerId,
        customerName: `${customer.firstName} ${customer.lastName}`,
        balance: balanceSummary.currentBalance,
        totalDebits: balanceSummary.totalDebits,
        totalCredits: balanceSummary.totalCredits,
        totalSales: balanceSummary.totalSales,
        totalPayments: balanceSummary.totalPayments,
        totalAdvances: balanceSummary.totalAdvances,
        totalAdvanceAllocations: balanceSummary.totalAdvanceAllocations,
        effectiveDebits: balanceSummary.effectiveDebits,
        status: balanceSummary.status,
        message: balanceSummary.message,
        formattedBalance: balanceSummary.formattedBalance,
        orderCount: orders.length,
        orders: orders.slice(0, 10) // Last 10 orders
      }
    });

  } catch (error) {
    console.error('Get customer balance error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

async function getAllCustomerBalances() {
  try {
    // Get customer role
    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
      return NextResponse.json({
        success: false,
        message: 'Customer role not found'
      }, { status: 404 });
    }

    // Get all customers
    const customers = await (User as any).find({ role: customerRole._id })
      .select('_id firstName lastName phone')
      .lean();

    // Calculate balance for each customer
    const customerBalances = await Promise.all(
      customers.map(async (customer: any) => {
        try {
          // Get customer balance using utility function
          const balanceSummary = await getCustomerBalanceSummary(customer._id);

          return {
            customerId: customer._id,
            customerName: `${customer.firstName} ${customer.lastName}`,
            phone: customer.phone,
            balance: balanceSummary.currentBalance,
            totalDebits: balanceSummary.totalDebits,
            totalCredits: balanceSummary.totalCredits,
            effectiveDebits: balanceSummary.effectiveDebits,
            status: balanceSummary.status,
            message: balanceSummary.message,
            formattedBalance: balanceSummary.formattedBalance
          };
        } catch (error) {
          console.error(`Error calculating balance for customer ${customer.firstName}:`, error);
          return {
            customerId: customer._id,
            customerName: `${customer.firstName} ${customer.lastName}`,
            phone: customer.phone,
            balance: 0,
            totalDebits: 0,
            totalCredits: 0,
            effectiveDebits: 0,
            status: 'error',
            message: 'Failed to calculate balance',
            formattedBalance: '0 PKR'
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        customerBalances,
        totalCustomers: customerBalances.length
      }
    });

  } catch (error) {
    console.error('Get all customer balances error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
