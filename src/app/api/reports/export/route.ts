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
    const type = searchParams.get('type');
    const format = searchParams.get('format') || 'csv';

    if (!month) {
      return NextResponse.json({
        success: false,
        message: 'Month parameter is required (YYYY-MM format)'
      }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({
        success: false,
        message: 'Type parameter is required (ledger|sales|expenses)'
      }, { status: 400 });
    }

    if (!['csv', 'pdf'].includes(format)) {
      return NextResponse.json({
        success: false,
        message: 'Format must be csv or pdf'
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

    // Build filter based on type
    let filter: any = { year, monthNumber: monthNum };
    
    if (type === 'sales') {
      filter.type = 'sale';
    } else if (type === 'expenses') {
      filter.type = { $in: ['expense', 'purchase'] };
    }
    // For ledger type, no additional filter needed

    // Get transactions
    const transactions = await (LedgerTransaction as any).find(filter)
      .sort({ date: 1, createdAt: 1 })
      .lean();

    if (format === 'csv') {
      // Generate CSV content
      const csvContent = generateCSV(transactions, type, month);
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${type}-${month}.csv"`
        }
      });
    } else if (format === 'pdf') {
      // For now, return a placeholder message
      // PDF generation would require additional libraries like puppeteer or jsPDF
      return NextResponse.json({
        success: false,
        message: 'PDF export is not yet implemented. Please use CSV format.'
      }, { status: 501 });
    }

    return NextResponse.json({
      success: false,
      message: 'Unsupported format'
    }, { status: 400 });

  } catch (error) {
    console.error('Export report error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

function generateCSV(transactions: any[], _type: string, _month: string): string {
  // CSV headers
  let headers = ['Date', 'Type', 'Method', 'Description', 'Credit', 'Debit', 'Running Balance'];
  
  // Add reference fields if available
  if (transactions.length > 0 && transactions[0].ref) {
    if (transactions[0].ref.party) headers.push('Party');
    if (transactions[0].ref.orderId) headers.push('Order ID');
    if (transactions[0].ref.productId) headers.push('Product ID');
    if (transactions[0].ref.txnNo) headers.push('Transaction No');
  }

  // CSV rows
  const rows = transactions.map(txn => {
    const row = [
      new Date(txn.date).toLocaleDateString(),
      txn.type,
      txn.method,
      txn.description,
      txn.credit || 0,
      txn.debit || 0,
      txn.runningBalance || 0
    ];

    // Add reference fields
    if (txn.ref) {
      if (txn.ref.party) row.push(txn.ref.party);
      if (txn.ref.orderId) row.push(txn.ref.orderId);
      if (txn.ref.productId) row.push(txn.ref.productId);
      if (txn.ref.txnNo) row.push(txn.ref.txnNo);
    }

    return row;
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}
