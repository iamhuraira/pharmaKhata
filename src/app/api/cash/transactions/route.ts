import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LedgerTransaction } from '@/lib/models/ledger';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure model is registered
    LedgerTransaction;
    
    const body = await request.json();
    
    const {
      date,
      type,
      method,
      description,
      credit,
      debit,
      ref
    } = body;

    // Validate required fields
    if (!date || !type || !method || !description) {
      return NextResponse.json({
        success: false,
        message: 'Date, type, method, and description are required'
      }, { status: 400 });
    }

    // Validate that exactly one of credit or debit is > 0
    if ((credit > 0 && debit > 0) || (credit === 0 && debit === 0)) {
      return NextResponse.json({
        success: false,
        message: 'Exactly one of credit or debit must be greater than 0'
      }, { status: 400 });
    }

    // Get last transaction for running balance
    const lastTransaction = await (LedgerTransaction as any).findOne()
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const lastBalance = lastTransaction ? lastTransaction.runningBalance : 0;
    const runningBalance = lastBalance + (credit - debit);

    // Create transaction
    const transaction = new LedgerTransaction({
      date: new Date(date),
      type,
      method,
      description,
      ref,
      credit: credit || 0,
      debit: debit || 0,
      runningBalance
    });

    await transaction.save();

    return NextResponse.json({
      success: true,
      data: {
        transactionId: transaction._id,
        txnId: transaction.txnId,
        runningBalance: transaction.runningBalance
      },
      message: 'Transaction created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure model is registered
    LedgerTransaction;
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const method = searchParams.get('method');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build filter
    const filter: any = {};
    
    if (type) {
      filter.type = type;
    }
    
    if (method) {
      filter.method = method;
    }
    
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    
    if (q) {
      filter.$or = [
        { description: { $regex: q, $options: 'i' } },
        { 'ref.party': { $regex: q, $options: 'i' } },
        { 'ref.orderId': { $regex: q, $options: 'i' } }
      ];
    }

    // Execute query
    const skip = (page - 1) * limit;
    
    const [transactions, total] = await Promise.all([
      (LedgerTransaction as any).find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (LedgerTransaction as any).countDocuments(filter)
    ]);

    // Map transactions to frontend format
    const mappedTransactions = transactions.map((txn: any) => ({
      id: txn._id,
      txnId: txn.txnId,
      date: txn.date,
      type: txn.type,
      method: txn.method,
      description: txn.description,
      ref: txn.ref,
      credit: txn.credit || 0,
      debit: txn.debit || 0,
      runningBalance: txn.runningBalance || 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        transactions: mappedTransactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalTransactions: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
