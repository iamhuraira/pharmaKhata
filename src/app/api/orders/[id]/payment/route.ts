import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order } from '@/lib/models/order';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';
import { LedgerTransaction } from '@/lib/models/ledger';
import { updateCustomerBalance } from '@/lib/utils/customerBalance';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    Order && User && Role && LedgerTransaction;
    
    const { id } = await params;
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

    // Find the order
    const order = await (Order as any).findById(id).lean();
    if (!order) {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 });
    }

    // Check if order is already fully paid
    if (order.totals.balance <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Order is already fully paid'
      }, { status: 400 });
    }

    // Validate payment amount doesn't exceed balance due
    if (amount > order.totals.balance) {
      return NextResponse.json({
        success: false,
        message: `Payment amount cannot exceed balance due (PKR ${order.totals.balance.toLocaleString()})`
      }, { status: 400 });
    }

    // Get customer
    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
      return NextResponse.json({
        success: false,
        message: 'Customer role not found'
      }, { status: 404 });
    }

    const customer = await User.findOne({ 
      _id: order.customer.id, 
      role: customerRole._id 
    });
    
    if (!customer) {
      return NextResponse.json({
        success: false,
        message: 'Customer not found'
      }, { status: 404 });
    }

    // Update order totals
    const newAmountReceived = order.totals.amountReceived + amount;
    const newBalance = order.totals.grandTotal - newAmountReceived - order.totals.advanceUsed;
    
    // Determine new order status
    let newStatus = order.status;
    if (newBalance <= 0) {
      newStatus = 'paid';
    } else if (newAmountReceived > 0) {
      newStatus = 'partial';
    }

    // Update order
    await (Order as any).findByIdAndUpdate(id, {
      $set: {
        'totals.amountReceived': newAmountReceived,
        'totals.balance': newBalance,
        'status': newStatus,
        'paymentHistory': [
          ...(order.paymentHistory || []),
          {
            method: method,
            amount: amount,
            reference: reference,
            date: new Date(date),
            type: 'payment'
          }
        ]
      }
    });

    // Get last ledger transaction for running balance
    const lastTransaction = await (LedgerTransaction as any).findOne({})
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const lastBalance = lastTransaction ? lastTransaction.runningBalance : 0;
    const runningBalance = lastBalance + amount; // Payment increases cash balance

    // Create ledger transaction for the payment
    const ledgerTransaction = new LedgerTransaction({
      date: new Date(date),
      type: 'payment',
      method: method,
      description: `Payment for Order ${order.orderId} - ${customer.firstName} ${customer.lastName}`,
      ref: {
        customerId: order.customer.id,
        orderId: order.orderId,
        party: `${customer.firstName} ${customer.lastName}`,
        txnNo: reference,
        note: note
      },
      credit: amount, // Credit increases cash (customer pays)
      debit: 0,      // No debit for customer payments
      runningBalance
    });

    await ledgerTransaction.save();

    // Update customer balance (payment reduces debt, so we add to balance)
    const newCustomerBalance = await updateCustomerBalance(order.customer.id, amount, 'order_payment');

    // Get updated order
    const updatedOrder = await (Order as any).findById(id).lean();

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        order: updatedOrder,
        payment: {
          id: ledgerTransaction._id,
          amount,
          method,
          reference,
          date: ledgerTransaction.date,
          note,
          customerBalance: newCustomerBalance,
          orderBalance: newBalance
        }
      }
    });

  } catch (error) {
    console.error('Error recording order payment:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
