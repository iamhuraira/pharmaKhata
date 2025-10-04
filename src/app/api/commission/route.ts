import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LedgerTransaction } from '@/lib/models/ledger';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    LedgerTransaction && User && Role;
    
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

    // Get salesman role
    const salesmanRole = await Role.findOne({ name: 'salesman' });
    if (!salesmanRole) {
      return NextResponse.json({
        success: false,
        message: 'Salesman role not found'
      }, { status: 404 });
    }

    // Get all salesmen
    const salesmen = await (User as any).find({ role: salesmanRole._id }).lean();

    // Commission rules (can be made configurable later)
    const commissionRules = [
      { basis: 'sales', ratePct: 10 } // 10% commission on sales
    ];

    // Calculate commission for each salesman
    const salesmanCommissions = await Promise.all(
      salesmen.map(async (salesman: any) => {
        // Get sales transactions for this salesman in the month
        const salesTransactions = await (LedgerTransaction as any).find({
          type: 'sale',
          year,
          monthNumber: monthNum,
          'ref.salesmanId': salesman._id
        }).lean();

        // Calculate total sales
        const totalSales = salesTransactions.reduce((sum: number, txn: any) => {
          return sum + (txn.debit || 0);
        }, 0);

        // Calculate commission based on rules
        let commissionEarned = 0;
        commissionRules.forEach(rule => {
          if (rule.basis === 'sales') {
            commissionEarned += totalSales * (rule.ratePct / 100);
          }
        });

        return {
          salesmanId: salesman._id,
          salesmanName: `${salesman.firstName} ${salesman.lastName}`,
          totalSales,
          commissionEarned
        };
      })
    );

    // Calculate totals
    const totalSales = salesmanCommissions.reduce((sum: number, sc: any) => sum + sc.totalSales, 0);
    const totalCommission = salesmanCommissions.reduce((sum: number, sc: any) => sum + sc.commissionEarned, 0);

    return NextResponse.json({
      success: true,
      data: {
        month,
        rules: commissionRules,
        totalSales,
        commissionEarned: totalCommission,
        salesmanCommissions
      }
    });

  } catch (error) {
    console.error('Get commission error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
