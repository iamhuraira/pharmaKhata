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
      quantity, // purchased quantity to add to stock
      purchasePrice, // per unit purchase price (required)
      sellingPrice, // optional: update product price
      date, // optional date
      method = 'cash', // cash | bank | jazzcash | card | other
      note, // optional description
      invoiceNo // optional reference number
    } = body;

    if (!productId || !quantity || !purchasePrice) {
      return NextResponse.json({
        success: false,
        message: 'productId, quantity, and purchasePrice are required'
      }, { status: 400 });
    }

    if (quantity <= 0 || purchasePrice < 0) {
      return NextResponse.json({
        success: false,
        message: 'quantity must be > 0 and purchasePrice cannot be negative'
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

    // Compute totals
    const totalPurchaseAmount = Number((quantity * purchasePrice).toFixed(2));

    // Update product stock and prices
    product.quantity = (product.quantity || 0) + quantity;
    // Track last purchase price (could be extended to moving average later)
    (product as any).purchasePrice = purchasePrice;
    if (typeof sellingPrice === 'number' && sellingPrice >= 0) {
      product.price = sellingPrice;
    }
    await product.save();

    // Record ledger transaction (only debit for purchase - money going out)
    const lastTxn = await (LedgerTransaction as any).findOne().sort({ date: -1, createdAt: -1 }).lean();
    const lastBalance = lastTxn ? lastTxn.runningBalance : 0;
    const finalBalance = lastBalance - totalPurchaseAmount; // debit reduces balance

    const description = note || `Purchase: ${quantity} x ${product.name} @ ${purchasePrice}`;

    const ledger = new LedgerTransaction({
      date: date ? new Date(date) : new Date(),
      type: 'purchase',
      method,
      description,
      ref: {
        productId: product._id,
        txnNo: invoiceNo,
        voucher: 'PUR'
      },
      credit: 0,
      debit: totalPurchaseAmount,
      runningBalance: finalBalance
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
        purchase: {
          quantity,
          unitPurchasePrice: purchasePrice,
          totalAmount: totalPurchaseAmount,
          sellingPriceApplied: typeof sellingPrice === 'number' ? sellingPrice : undefined
        },
        ledger: {
          id: ledger._id,
          txnId: ledger.txnId,
          runningBalance: ledger.runningBalance
        }
      },
      message: 'Stock purchased and recorded successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Purchase stock error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}


