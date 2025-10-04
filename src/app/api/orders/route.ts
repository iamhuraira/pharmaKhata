import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order } from '@/lib/models/order';
import { User } from '@/lib/models/user';
import { Product } from '@/lib/models/product';
import { Role } from '@/lib/models/roles';
import { LedgerTransaction } from '@/lib/models/ledger';
import { updateCustomerBalance, getCustomerBalanceFromDB } from '@/lib/utils/customerBalance';

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
      payment,
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

    // Calculate item-level discount total
    const itemDiscountTotal = items.reduce((sum: number, item: any) => {
      return sum + (item.discountValue || 0);
    }, 0);

    // Calculate order-level discount
    let orderDiscountTotal = 0;
    if (orderDiscount && orderDiscount.value > 0) {
      if (orderDiscount.type === 'percentage') {
        orderDiscountTotal = subTotal * (orderDiscount.value / 100);
      } else {
        orderDiscountTotal = orderDiscount.value;
      }
    }

    // Total discount = item-level discounts + order-level discount
    const discountTotal = itemDiscountTotal + orderDiscountTotal;

    const taxTotal = 0; // For now, no tax
    const grandTotal = subTotal - discountTotal + taxTotal;
    
    // Get current customer balance from database
    const currentCustomerBalance = await getCustomerBalanceFromDB(customer.id);
    
    // Handle payment and advance logic
    let amountReceived = payment?.amountReceived || 0;
    let advanceUsed = 0;
    let balance = grandTotal;

    // Check if customer has advance balance to auto-allocate
    if (currentCustomerBalance > 0) { // Positive balance means advance available
      advanceUsed = Math.min(currentCustomerBalance, grandTotal);
      balance = grandTotal - advanceUsed;
      
      console.log(`🔍 Advance Allocation: Customer has ${currentCustomerBalance} PKR advance, Order total: ${grandTotal} PKR`);
      console.log(`🔍 Advance used: ${advanceUsed} PKR, Balance due: ${balance} PKR`);
    } else {
      // No advance available, calculate balance based on amount received
      balance = grandTotal - amountReceived;
    }

    // For on_account orders, set amountReceived to 0 and handle payment object
    if (payment?.method === 'on_account') {
      amountReceived = 0;
      // Keep advanceUsed as calculated above (don't reset to 0)
      // Balance remains as calculated above (grandTotal - advanceUsed)
      // Set payment type to on_account
      if (payment) {
        payment.type = 'on_account';
        payment.amount = 0; // Set amount to 0 for on_account orders
      }
    }

    // Create order
    const order = new Order({
      customer: {
        id: customer.id,
        name: customer.name || `${customerExists.firstName} ${customerExists.lastName}`,
        phone: customer.phone || customerExists.phone,
        balance: customer.balance || 0
      },
      items: items.map((item: any) => {
        const itemSubtotal = item.qty * item.price;
        const itemDiscountValue = item.discountValue || 0;
        const itemTotal = itemSubtotal - itemDiscountValue;
        
        return {
          ...item,
          discountPercentage: item.discountPercentage || 0,
          discountValue: itemDiscountValue,
          total: itemTotal
        };
      }),
      notes,
      payment: payment ? {
        ...payment,
        type: payment.method === 'on_account' ? 'on_account' : 'payment',
        amount: payment.method === 'on_account' ? 0 : (payment.amount || 0)
      } : undefined,
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
      status: balance <= 0 ? 'paid' : (advanceUsed > 0 ? 'partial' : 'created')
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

    // Create main order transaction (customer owes the FULL order amount)
    const ledgerTransaction = new LedgerTransaction({
      date: new Date(),
      type: 'sale',
      method: payment?.method === 'on_account' ? 'on_account' : (payment?.method || 'advance'),
      description: `Order ${order.orderId} - ${customerExists.firstName} ${customerExists.lastName}`,
      ref: {
        customerId: customer.id,
        orderId: order.orderId,
        party: `${customerExists.firstName} ${customerExists.lastName}`
      },
      credit: 0,
      debit: grandTotal, // Debit shows FULL order amount
      runningBalance
    });

    await ledgerTransaction.save();

    // Create payment transaction if payment was received (not on_account)
    if (payment?.method !== 'on_account' && amountReceived > 0) {
      const paymentTransaction = new LedgerTransaction({
        date: new Date(),
        type: 'payment',
        method: payment.method,
        description: `Payment received for Order ${order.orderId} - ${customerExists.firstName} ${customerExists.lastName}`,
        ref: {
          customerId: customer.id,
          orderId: order.orderId,
          party: `${customerExists.firstName} ${customerExists.lastName}`
        },
        credit: amountReceived, // Credit shows payment received
        debit: 0,
        runningBalance: lastBalance + amountReceived // Add payment to running balance
      });

      await paymentTransaction.save();
      console.log(`🔍 Payment transaction created: ${amountReceived} PKR via ${payment.method}`);
    }

    // Note: Advance allocation is handled in order totals, not as separate ledger transaction
    // The advance was already credited when the customer made the advance payment
    // The order transaction shows the full amount owed, and the advance allocation
    // is tracked in the order totals for display purposes

    // Update customer balance directly
    // For on_account orders: Customer owes the full order amount (negative balance change)
    // For paid orders: Customer owes (order amount - payment received)
    if (payment?.method === 'on_account') {
      // On account: customer owes the full amount
      await updateCustomerBalance(customer.id, -grandTotal, 'order_creation');
    } else {
      // Paid order: customer owes (order amount - payment received)
      const balanceChange = -grandTotal + amountReceived;
      await updateCustomerBalance(customer.id, balanceChange, 'order_creation');
      console.log(`🔍 Customer balance update: Order ${grandTotal} - Payment ${amountReceived} = Balance change ${balanceChange}`);
    }

    // ❌ REMOVED: Additional on-account transaction creation
    // The main transaction already shows the correct NET amount owed
    // No need for additional transactions that would double-count the debt

    // ❌ REMOVED: Advance allocation transaction creation
    // Advance allocation is now handled internally in the balance calculation
    // No need to create a separate ledger transaction for this

    // Calculate final customer balance after this order using utility function
    const balanceAfterOrder = await getCustomerBalanceFromDB(customer.id);

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        totals: order.totals,
        customerBalance: {
          beforeOrder: currentCustomerBalance,
          afterOrder: balanceAfterOrder,
          orderTotal: grandTotal,
          advanceUsed,
          balanceDue: balance,
          message: `Customer balance updated to ${balanceAfterOrder} PKR`
        }
      },
      message: 'Order created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    User && Role;
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build filter
    const filter: any = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    
    if (q) {
      filter.$or = [
        { 'customer.name': { $regex: q, $options: 'i' } },
        { 'customer.phone': { $regex: q, $options: 'i' } },
        { orderId: { $regex: q, $options: 'i' } }
      ];
    }

    // Execute query
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      (Order as any).find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customer.id', 'firstName lastName phone email currentAddress balance')
        .populate('items.productId', 'name packType shortDescription')
        .lean(),
      (Order as any).countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
