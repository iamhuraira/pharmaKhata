import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LedgerTransaction } from '@/lib/models/ledger';
import { Product } from '@/lib/models/product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    LedgerTransaction && Product;
    
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

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

    // Get transactions for the month
    const monthTransactions = await (LedgerTransaction as any).find({
      year,
      monthNumber: monthNum
    }).lean();

    // Calculate cash in hand
    const cashInHand = await (LedgerTransaction as any).aggregate([
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

    const openingBalance = cashInHand.length > 0 
      ? (cashInHand[0].totalCredit - cashInHand[0].totalDebit)
      : 0;

    // Calculate monthly totals
    let totalCashIn = 0;
    let totalCashSentToCompany = 0;
    let totalSales = 0;
    let totalPurchases = 0;
    let totalExpenses = 0;
    let totalCommission = 0;

    const byMethod: any = {};
    const byMethodCompany: any = {};

    monthTransactions.forEach((txn: any) => {
      const method = txn.method || 'other';
      
      if (txn.credit > 0) {
        totalCashIn += txn.credit;
        if (!byMethod[method]) byMethod[method] = 0;
        byMethod[method] += txn.credit;
      }
      
      if (txn.debit > 0) {
        if (txn.type === 'company_remit') {
          totalCashSentToCompany += txn.debit;
          if (!byMethodCompany[method]) byMethodCompany[method] = 0;
          byMethodCompany[method] += txn.debit;
        } else if (txn.type === 'sale') {
          totalSales += txn.debit;
        } else if (txn.type === 'purchase') {
          totalPurchases += txn.debit;
        } else if (txn.type === 'expense') {
          totalExpenses += txn.debit;
        } else if (txn.type === 'commission') {
          totalCommission += txn.debit;
        }
      }
    });

    // Calculate closing balance
    const closingBalance = openingBalance + totalCashIn - totalCashSentToCompany - totalExpenses;

    // Get stock value
    const stockValue = await (Product as any).aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } }
        }
      }
    ]);

    const remainingStockValue = stockValue.length > 0 ? stockValue[0].totalValue : 0;

    // Calculate savings/profit
    const savingsProfit = totalSales - totalPurchases - totalExpenses + totalCommission;

    return NextResponse.json({
      success: true,
      data: {
        month,
        cashInHand: {
          opening: openingBalance,
          closing: closingBalance
        },
        cashIn: {
          total: totalCashIn,
          bySource: byMethod
        },
        cashSentToCompany: {
          total: totalCashSentToCompany,
          byMethod: byMethodCompany
        },
        remainingCashInHand: closingBalance,
        commission: totalCommission,
        sales: {
          monthlyTotal: totalSales
        },
        purchases: {
          monthlyTotal: totalPurchases
        },
        expenses: {
          misc: totalExpenses,
          total: totalExpenses
        },
        stock: {
          remainingValue: remainingStockValue
        },
        savingsProfit
      }
    });

  } catch (error) {
    console.error('Get monthly summary error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
