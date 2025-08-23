import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';
import { LedgerTransaction } from '@/lib/models/ledger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    User && Role && LedgerTransaction;
    
    const { id: customerId } = await params;
    const body = await request.json();
    
    const {
      amount,
      method,
      reference,
      date,
      note
    } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Valid amount is required'
      }, { status: 400 });
    }

    if (!method) {
      return NextResponse.json({
        success: false,
        message: 'Payment method is required'
      }, { status: 400 });
    }

    if (!reference) {
      return NextResponse.json({
        success: false,
        message: 'Reference is required'
      }, { status: 400 });
    }

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

    // Get last transaction for running balance calculation
    const lastTransaction = await (LedgerTransaction as any).findOne()
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const lastBalance = lastTransaction ? lastTransaction.runningBalance : 0;
    const runningBalance = lastBalance + amount; // Payment increases cash balance

    // Determine if this is an advance payment or debt payment
    const currentBalance = (customer as any).balance || 0;
    let newBalance: number;
    let transactionType: string;
    let description: string;

    if (currentBalance <= 0) {
      // Customer owes money - this payment reduces debt
      newBalance = currentBalance - amount;
      transactionType = 'payment';
      description = `Payment from ${customer.firstName} ${customer.lastName} - ${note || 'Debt payment'}`;
    } else {
      // Customer has advance credit - this payment increases advance
      newBalance = currentBalance + amount;
      transactionType = 'advance';
      description = `Advance payment from ${customer.firstName} ${customer.lastName} - ${note || 'Advance payment'}`;
    }

    // Create ledger transaction for the payment
    const ledgerTransaction = new LedgerTransaction({
      date: new Date(date),
      type: transactionType,
      method: method,
      description: description,
      ref: {
        customerId: customerId,
        party: `${customer.firstName} ${customer.lastName}`,
        txnNo: reference,
        note: note
      },
      credit: amount, // Credit increases cash (customer pays)
      debit: 0,      // No debit for customer payments
      runningBalance
    });

    await ledgerTransaction.save();

    // Update customer balance
    await User.findByIdAndUpdate(customerId, {
      balance: newBalance
    });

    return NextResponse.json({
      success: true,

      message: transactionType === 'advance' ? 'Advance payment recorded successfully' : 'Payment recorded successfully',
      data: {
        payment: {
          id: ledgerTransaction._id,
          amount,
          method,
          reference,
          date: ledgerTransaction.date,
          note,
          customerBalance: newBalance,
          type: transactionType
        }
      }
    });

  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to record payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
