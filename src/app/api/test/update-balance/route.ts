import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';
import { updateCustomerBalance } from '@/lib/utils/customerBalance';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    User && Role;
    
    const body = await request.json();
    const { customerId, amount } = body;

    if (!customerId || !amount) {
      return NextResponse.json({
        success: false,
        message: 'customerId and amount are required'
      }, { status: 400 });
    }

    // Get customer role
    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
      return NextResponse.json({
        success: false,
        message: 'Customer role not found'
      }, { status: 404 });
    }

    // Check if customer exists
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

    console.log(`🔍 Test - Customer found: ${customer.firstName} ${customer.lastName}`);
    console.log(`🔍 Test - Current balance: ${customer.balance}`);
    console.log(`🔍 Test - About to update balance by: ${amount}`);

    // Test the updateCustomerBalance function
    const newBalance = await updateCustomerBalance(customerId, amount, 'test_update');

    console.log(`🔍 Test - Function returned balance: ${newBalance}`);

    // Verify by fetching from database
    const updatedCustomer = await User.findById(customerId).select('balance');
    const dbBalance = updatedCustomer?.balance || 0;

    console.log(`🔍 Test - Database balance after update: ${dbBalance}`);

    return NextResponse.json({
      success: true,
      message: 'Balance update test completed',
      data: {
        customerId,
        customerName: `${customer.firstName} ${customer.lastName}`,
        oldBalance: customer.balance || 0,
        updateAmount: amount,
        functionReturned: newBalance,
        databaseBalance: dbBalance,
        success: newBalance === dbBalance && newBalance === (customer.balance || 0) + amount
      }
    });

  } catch (error) {
    console.error('Test update balance error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
