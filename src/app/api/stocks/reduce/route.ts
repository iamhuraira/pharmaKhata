import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Product } from '@/lib/models/product';
import { LedgerTransaction } from '@/lib/models/ledger';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Ensure models are registered
    Product && LedgerTransaction;

    const body = await request.json();

    const {
      productId,
      quantity, // quantity to reduce from stock
      reason = 'stock_adjustment', // reason for reduction
      date, // optional date
      method = 'other', // method for ledger
      note, // optional description
      referenceNo // optional reference number
    } = body;

    if (!productId || !quantity) {
      return NextResponse.json({
        success: false,
        message: 'productId and quantity are required'
      }, { status: 400 });
    }

    if (quantity <= 0) {
      return NextResponse.json({
        success: false,
        message: 'quantity must be greater than 0'
      }, { status: 400 });
    }

    // Fetch product
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }

    // Check if sufficient stock available
    if (product.quantity < quantity) {
      return NextResponse.json({
        success: false,
        message: `Insufficient stock. Available: ${product.quantity}, Requested: ${quantity}`
      }, { status: 400 });
    }

    // Update product stock
    const newQuantity = product.quantity - quantity;
    product.quantity = newQuantity;
    await product.save();

    // Calculate the value of reduced stock based on purchase price
    const purchasePrice = (product as any).purchasePrice || 0;
    const reducedStockValue = quantity * purchasePrice;

    // Record ledger transaction (credit for reduced stock value)
    const lastTxn = await (LedgerTransaction as any).findOne().sort({ date: -1, createdAt: -1 }).lean();
    const lastBalance = lastTxn ? lastTxn.runningBalance : 0;
    const runningBalance = lastBalance + reducedStockValue; // credit increases balance

    const description = note || `Stock reduction: ${quantity} x ${product.name} @ ${purchasePrice} - ${reason}`;

    const ledger = new LedgerTransaction({
      date: date ? new Date(date) : new Date(),
      type: 'adjustment',
      method,
      description,
      ref: {
        productId: product._id,
        txnNo: referenceNo,
        voucher: 'STK-RED'
      },
      credit: reducedStockValue,
      debit: 0,
      runningBalance
    });

    await ledger.save();

    return NextResponse.json({
      success: true,
      data: {
        product: {
          id: product._id,
          name: product.name,
          quantity: product.quantity,
          price: product.price,
          purchasePrice: (product as any).purchasePrice || 0
        },
        reduction: {
          quantity,
          reason,
          newStock: newQuantity,
          purchasePrice,
          reducedValue: reducedStockValue
        },
        ledger: {
          id: ledger._id,
          txnId: ledger.txnId,
          runningBalance: ledger.runningBalance
        }
      },
      message: 'Stock reduced successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Reduce stock error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
