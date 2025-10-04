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

    // Get sales transactions
    const salesTransactions = monthTransactions.filter((txn: any) => txn.type === 'sale');
    const purchaseTransactions = monthTransactions.filter((txn: any) => txn.type === 'purchase');

    // Group sales by day
    const salesByDay: any = {};
    salesTransactions.forEach((txn: any) => {
      const day = new Date(txn.date).getDate();
      if (!salesByDay[day]) {
        salesByDay[day] = {
          total: 0,
          count: 0,
          transactions: []
        };
      }
      salesByDay[day].total += txn.debit || 0;
      salesByDay[day].count += 1;
      salesByDay[day].transactions.push({
        id: txn._id,
        description: txn.description,
        amount: txn.debit || 0,
        method: txn.method,
        ref: txn.ref
      });
    });

    // Group purchases by day
    const purchasesByDay: any = {};
    purchaseTransactions.forEach((txn: any) => {
      const day = new Date(txn.date).getDate();
      if (!purchasesByDay[day]) {
        purchasesByDay[day] = {
          total: 0,
          count: 0,
          transactions: []
        };
      }
      purchasesByDay[day].total += txn.debit || 0;
      purchasesByDay[day].count += 1;
      purchasesByDay[day].transactions.push({
        id: txn._id,
        description: txn.description,
        amount: txn.debit || 0,
        method: txn.method,
        ref: txn.ref
      });
    });

    // Calculate totals
    const totalSales = salesTransactions.reduce((sum: number, txn: any) => sum + (txn.debit || 0), 0);
    const totalPurchases = purchaseTransactions.reduce((sum: number, txn: any) => sum + (txn.debit || 0), 0);

    // Group by payment method
    const salesByMethod: any = {};
    salesTransactions.forEach((txn: any) => {
      const method = txn.method || 'other';
      if (!salesByMethod[method]) salesByMethod[method] = 0;
      salesByMethod[method] += txn.debit || 0;
    });

    const purchasesByMethod: any = {};
    purchaseTransactions.forEach((txn: any) => {
      const method = txn.method || 'other';
      if (!purchasesByMethod[method]) purchasesByMethod[method] = 0;
      purchasesByMethod[method] += txn.debit || 0;
    });

    // Get top products by sales (if product references exist)
    const productSales: any = {};
    salesTransactions.forEach((txn: any) => {
      if (txn.ref?.productId) {
        if (!productSales[txn.ref.productId]) {
          productSales[txn.ref.productId] = {
            productId: txn.ref.productId,
            productName: txn.ref.productName || 'Unknown',
            totalSales: 0,
            quantity: 0
          };
        }
        productSales[txn.ref.productId].totalSales += txn.debit || 0;
        productSales[txn.ref.productId].quantity += txn.ref.quantity || 1;
      }
    });

    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.totalSales - a.totalSales)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        month,
        summary: {
          totalSales,
          totalPurchases,
          netAmount: totalSales - totalPurchases
        },
        sales: {
          byDay: salesByDay,
          byMethod: salesByMethod,
          totalTransactions: salesTransactions.length
        },
        purchases: {
          byDay: purchasesByDay,
          byMethod: purchasesByMethod,
          totalTransactions: purchaseTransactions.length
        },
        topProducts,
        dailyBreakdown: Array.from({ length: 31 }, (_, i) => i + 1).map(day => ({
          day,
          sales: salesByDay[day] || { total: 0, count: 0, transactions: [] },
          purchases: purchasesByDay[day] || { total: 0, count: 0, transactions: [] }
        }))
      }
    });

  } catch (error) {
    console.error('Get sales-purchase report error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
