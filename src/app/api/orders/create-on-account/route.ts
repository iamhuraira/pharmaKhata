import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order } from '@/lib/models/order';
import { User } from '@/lib/models/user';
import { Product } from '@/lib/models/product';
import { Role } from '@/lib/models/roles';
import { LedgerTransaction } from '@/lib/models/ledger';
import { calculateCustomerBalance, calculateBalanceAfterOrder } from '@/lib/utils/customerBalance';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    User && Role && Product && LedgerTransaction;
    
    const body = await request.json();
    
    const {
      customer,
      items,
      notes,
      meta,
      orderDiscount
    } = body;

    // Validate required fields
    if (!customer?.id || !items || items.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Customer ID and items are required'
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

    const customerExists = await User.findOne({ 
      _id: customer.id, 
      role: customerRole._id 
    });
    
    if (!customerExists) {
      return NextResponse.json({
        success: false,
        message: 'Customer not found'
      }, { status: 400 });
    }

    // Validate products exist and check stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({
          success: false,
          message: `Product with ID ${item.productId} not found`
        }, { status: 404 });
      }

      if (product.quantity < item.qty) {
        return NextResponse.json({
          success: false,
          message: `Insufficient stock for product ${product.name}. Available: ${product.quantity}, Requested: ${item.qty}`
        }, { status: 400 });
      }
    }

    // Calculate totals
    const subTotal = items.reduce((sum: number, item: any) => {
      const itemTotal = item.qty * item.price;
      return sum + itemTotal;
    }, 0);

    // Calculate order-level discount
    let discountTotal = 0;
    if (orderDiscount && orderDiscount.value > 0) {
      if (orderDiscount.type === 'percentage') {
        discountTotal = subTotal * (orderDiscount.value / 100);
      } else {
        discountTotal = orderDiscount.value;
      }
    }

    const taxTotal = 0; // For now, no tax
    const grandTotal = subTotal - discountTotal + taxTotal;
    
    // For on_account orders, no advance is used and full amount is due
    const amountReceived = 0;
    let advanceUsed = 0;
    let balance = grandTotal; // Full amount is due initially

    // Get current customer balance using utility function
    const currentBalanceInfo = await calculateCustomerBalance(customer.id);
    const currentCustomerBalance = currentBalanceInfo.currentBalance;

    // Check if customer has advance balance to auto-allocate even for on-account orders
    if (currentCustomerBalance > 0) { // Positive balance means advance available
      advanceUsed = Math.min(currentCustomerBalance, grandTotal);
      balance = grandTotal - advanceUsed;
      
      console.log(`🔍 On-Account Order with Advance: Customer has ${currentCustomerBalance} PKR advance, Order total: ${grandTotal} PKR`);
      console.log(`🔍 Advance used: ${advanceUsed} PKR, Balance due: ${balance} PKR`);
    }

    // Create order
    const order = new Order({
      customer: {
        id: customer.id,
        name: customer.name || `${customerExists.firstName} ${customerExists.lastName}`,
        phone: customer.phone || customerExists.phone
      },
      items: items.map((item: any) => ({
        ...item,
        total: (item.qty * item.price) - ((item.discount || 0) * item.qty)
      })),
      notes,
      payment: {
        method: 'on_account',
        type: 'on_account',
        amount: 0,
        date: new Date()
      },
      meta,
      totals: {
        subTotal,
        discountTotal,
        taxTotal,
        grandTotal,
        amountReceived,
        balance,
        advanceUsed
      },
      status: 'created' // Order created on account
    });

    await order.save();

    // Update product quantities
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.qty }
      });
    }

    // Create ledger transaction for the order (customer owes money)
    const lastTransaction = await (LedgerTransaction as any).findOne()
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const lastBalance = lastTransaction ? lastTransaction.runningBalance : 0;
    const runningBalance = lastBalance; // No cash movement for order creation

    const ledgerTransaction = new LedgerTransaction({
      date: new Date(),
      type: 'sale',
      method: 'on_account',
      description: `Order ${order.orderId} - ${customerExists.firstName} ${customerExists.lastName} (On Account)`,
      ref: {
        customerId: customer.id,
        orderId: order.orderId,
        party: `${customerExists.firstName} ${customerExists.lastName}`
      },
      credit: 0,
      debit: grandTotal, // Debit increases AR (customer owes more)
      runningBalance
    });

    await ledgerTransaction.save();

    // If advance was used, create allocation transaction
    if (advanceUsed > 0) {
      const allocationTransaction = new LedgerTransaction({
        date: new Date(),
        type: 'advance',
        method: 'advance',
        description: `Advance allocation to order ${order.orderId}`,
        ref: {
          customerId: customer.id,
          orderId: order.orderId,
          party: `${customerExists.firstName} ${customerExists.lastName}`,
          txnNo: `ALLOC-${Date.now()}`
        },
        credit: advanceUsed, // Credit reduces AR (customer owes less)
        debit: 0,            // No debit for advance allocation
        runningBalance
      });

      await allocationTransaction.save();
      
      console.log(`🔍 Advance Allocation: ${advanceUsed} PKR advance allocated to order ${order.orderId}`);
    }

    // Calculate final customer balance after this order using utility function
    const balanceAfterOrder = await calculateBalanceAfterOrder(customer.id, grandTotal);

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        totals: order.totals,
        customerBalance: {
          beforeOrder: currentCustomerBalance,
          afterOrder: balanceAfterOrder.afterOrder,
          orderTotal: grandTotal,
          advanceUsed: 0,
          balanceDue: balance,
          message: balanceAfterOrder.message
        }
      },
      message: 'Order created on account successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create on-account order error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
