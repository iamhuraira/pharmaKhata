import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';
import { LedgerTransaction } from '@/lib/models/ledger';
import { Order } from '@/lib/models/order';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    User && Role && LedgerTransaction && Order;
    
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

    // Get all ledger transactions for this customer
    const transactions = await (LedgerTransaction as any).find({
      'ref.customerId': customerId
    })
    .sort({ date: -1, createdAt: -1 })
    .lean();

    // Get customer orders
    const orders = await (Order as any).find({
      'customer.id': customerId
    })
    .sort({ createdAt: -1 })
    .lean();

    // Calculate balance from ledger transactions
    let totalDebits = 0;  // Customer owes (sales, orders)
    let totalCredits = 0; // Customer pays (payments, advance allocations)

    transactions.forEach((txn: any) => {
      if (txn.type === 'sale') {
        totalDebits += txn.debit || 0;
      } else if (txn.type === 'payment') {
        totalCredits += txn.credit || 0;
      } else if (txn.type === 'advance' && txn.credit > 0) {
        // ✅ FIXED: Customer gives advance payment (CREDIT for you)
        totalCredits += txn.credit || 0;
      } else if (txn.type === 'advance' && txn.debit > 0) {
        // ✅ FIXED: Advance allocation to order (reduces what customer owes)
        totalCredits += txn.debit || 0;
      }
    });

    // Calculate balance: positive = advance, negative = amount due
    const balance = totalCredits - totalDebits;
    
    // Calculate from orders as backup
    let orderBasedBalance = 0;
    orders.forEach((order: any) => {
      const orderTotal = order.totals?.grandTotal || 0;
      const amountReceived = order.totals?.amountReceived || 0;
      const advanceUsed = order.totals?.advanceUsed || 0;
      
      orderBasedBalance += (amountReceived + advanceUsed) - orderTotal;
    });

    console.log(`🔍 Customer ${customer.firstName} ${customer.lastName}:`);
    console.log(`  - Ledger: Debits=${totalDebits}, Credits=${totalCredits}, Balance=${balance}`);
    console.log(`  - Orders: Balance=${orderBasedBalance}`);
    console.log(`  - Final Balance: ${balance}`);

    return NextResponse.json({
      success: true,
      data: {
        customerId,
        customerName: `${customer.firstName} ${customer.lastName}`,
        balance,
        totalDebits,
        totalCredits,
        orderBasedBalance,
        transactionCount: transactions.length,
        orderCount: orders.length,
        transactions: transactions.slice(0, 10), // Last 10 transactions
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
          // Get ledger transactions for this customer
          const transactions = await (LedgerTransaction as any).find({
            'ref.customerId': customer._id
          })
          .sort({ date: -1, createdAt: -1 })
          .lean();

          // Calculate balance
          let totalDebits = 0;
          let totalCredits = 0;

          transactions.forEach((txn: any) => {
            if (txn.type === 'sale') {
              totalDebits += txn.debit || 0;
            } else if (txn.type === 'payment') {
              totalCredits += txn.credit || 0;
            } else if (txn.type === 'advance' && txn.credit > 0) {
              // ✅ FIXED: Customer gives advance payment (CREDIT for you)
              totalCredits += txn.credit || 0;
            } else if (txn.type === 'advance' && txn.debit > 0) {
              // ✅ FIXED: Advance allocation to order (reduces what customer owes)
              totalCredits += txn.debit || 0;
            }
          });

          const balance = totalCredits - totalDebits;

          return {
            customerId: customer._id,
            customerName: `${customer.firstName} ${customer.lastName}`,
            phone: customer.phone,
            balance,
            totalDebits,
            totalCredits,
            transactionCount: transactions.length
          };
        } catch (error) {
          console.error(`Error calculating balance for customer ${customer._id}:`, error);
          return {
            customerId: customer._id,
            customerName: `${customer.firstName} ${customer.lastName}`,
            phone: customer.phone,
            balance: 0,
            totalDebits: 0,
            totalCredits: 0,
            transactionCount: 0,
            error: 'Failed to calculate balance'
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
