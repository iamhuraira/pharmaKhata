import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LedgerTransaction } from '@/lib/models/ledger';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure model is registered
    LedgerTransaction;
    
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const method = searchParams.get('method');
    const type = searchParams.get('type');
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!month) {
      return NextResponse.json({
        success: false,
        message: 'Month parameter is required (YYYY-MM format)'
      }, { status: 400 });
    }

    // Parse month
    const [year, monthNum] = month.split('-').map(Number);
    if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
      return NextResponse.json({
        success: false,
        message: 'Invalid month format. Use YYYY-MM format'
      }, { status: 400 });
    }

    // Build filter
    const filter: any = {
      year,
      monthNumber: monthNum
    };
    
    if (method) {
      filter.method = method;
    }
    
    if (type) {
      filter.type = type;
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
        .sort({ date: 1, createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (LedgerTransaction as any).countDocuments(filter)
    ]);

    // Calculate totals
    let totalCredit = 0;
    let totalDebit = 0;
    const byMethod: any = {};

    transactions.forEach((txn: any) => {
      totalCredit += txn.credit || 0;
      totalDebit += txn.debit || 0;
      
      const txnMethod = txn.method || 'other';
      if (!byMethod[txnMethod]) {
        byMethod[txnMethod] = { credit: 0, debit: 0 };
      }
      byMethod[txnMethod].credit += txn.credit || 0;
      byMethod[txnMethod].debit += txn.debit || 0;
    });

    // Get opening balance (sum of all transactions before this month)
    const openingBalance = await (LedgerTransaction as any).aggregate([
      {
        $match: {
          $or: [
            { year: { $lt: year } },
            { 
              year: year, 
              monthNumber: { $lt: monthNum } 
            }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalCredit: { $sum: '$credit' },
          totalDebit: { $sum: '$debit' }
        }
      }
    ]);

    const opening = openingBalance.length > 0 
      ? (openingBalance[0].totalCredit - openingBalance[0].totalDebit)
      : 0;

    const closingBalance = opening + (totalCredit - totalDebit);

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

    // Debug logging
    console.log('🔍 API Response Data:');
    console.log('  - Month:', month);
    console.log('  - Opening Balance:', opening);
    console.log('  - Total Credit:', totalCredit);
    console.log('  - Total Debit:', totalDebit);
    console.log('  - Closing Balance:', closingBalance);
    console.log('  - Transaction Count:', transactions.length);

    return NextResponse.json({
      success: true,
      data: {
        month,
        openingBalance: opening,
        totals: {
          credit: totalCredit,
          debit: totalDebit,
          closingBalance,
          byMethod
        },
        transactions: mappedTransactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalTransactions: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
          limit
        },
        notes: "Running balance = openingBalance + Σ(credit - debit)."
      }
    });

  } catch (error) {
    console.error('Get cash ledger error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
