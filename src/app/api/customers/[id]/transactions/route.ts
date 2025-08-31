import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';
import { LedgerTransaction } from '@/lib/models/ledger';
import { Order } from '@/lib/models/order';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    User && Role && LedgerTransaction && Order;
    
    const { id: customerId } = await params;
    
    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
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

    // Get total count for pagination
    const totalTransactions = await (LedgerTransaction as any).countDocuments({
      'ref.customerId': customerId
    });

    // Get paginated ledger transactions for this customer
    const transactions = await (LedgerTransaction as any).find({
      'ref.customerId': customerId
    })
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    // Get customer orders (for future use)
    // const orders = await (Order as any).find({
    //   'customer.id': customerId
    // })
    // .sort({ createdAt: -1 })
    // .lean();

    // Calculate summary from ledger transactions
    let totalOrders = 0;
    let totalPayments = 0;
    let totalAdvances = 0;
    let totalAdvanceAllocations = 0;

    transactions.forEach((txn: any) => {
      if (txn.type === 'sale') {
        totalOrders += txn.debit || 0;
      } else if (txn.type === 'payment') {
        totalPayments += txn.credit || 0;
      } else if (txn.type === 'advance' && txn.credit > 0) {
        // ✅ FIXED: Customer gives advance payment (CREDIT for you)
        totalAdvances += txn.credit || 0;
      } else if (txn.type === 'advance' && txn.debit > 0) {
        // ✅ FIXED: Advance allocation to order (reduces what customer owes)
        totalAdvanceAllocations += txn.debit || 0;
      }
    });

    // Include advance payments in total payments (customer pays money)
    const totalCustomerPayments = totalPayments + totalAdvances;
    
    // Calculate outstanding amount
    const outstandingAmount = totalOrders - totalPayments - totalAdvanceAllocations;

    // Map transactions to frontend format
    const mappedTransactions = transactions.map((txn: any) => ({
      id: txn._id,
      type: txn.type,
      method: txn.method,
      description: txn.description,
      debit: txn.debit || 0,
      credit: txn.credit || 0,
      date: txn.date,
      ref: txn.ref
    }));

    return NextResponse.json({
      success: true,
      data: {
        transactions: mappedTransactions,
        summary: {
          totalOrders,
          totalPayments: totalCustomerPayments, // Now includes advance payments
          totalAdvances,
          totalAdvanceAllocations,
          outstandingAmount
        },
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalTransactions,
          totalPages: Math.ceil(totalTransactions / limit),
          hasNextPage: page < Math.ceil(totalTransactions / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get customer transactions error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
