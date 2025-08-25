import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';
import { LedgerTransaction } from '@/lib/models/ledger';
import { calculateCustomerBalance, calculateBalanceAfterOrder } from '@/lib/utils/customerBalance';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const orderAmount = parseFloat(searchParams.get('orderAmount') || '0');
    
    if (!customerId) {
      return NextResponse.json({
        success: false,
        message: 'Customer ID is required'
      }, { status: 400 });
    }

    // Get customer info
    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
      return NextResponse.json({
        success: false,
        message: 'Customer role not found'
      }, { status: 404 });
    }

    const customer = await User.findOne({ 
      _id: customerId, 
      role: customerRole._id 
    });
    
    if (!customer) {
      return NextResponse.json({
        success: false,
        message: 'Customer not found'
      }, { status: 404 });
    }

    // Get all ledger transactions for detailed analysis
    const transactions = await (LedgerTransaction as any).find({
      'ref.customerId': customerId
    })
    .sort({ date: -1, createdAt: -1 })
    .lean();

    // Get current balance using utility function
    const currentBalance = await calculateCustomerBalance(customerId);
    
    // Calculate balance after order
    let balanceAfterOrder = null;
    if (orderAmount > 0) {
      balanceAfterOrder = await calculateBalanceAfterOrder(customerId, orderAmount);
    }

    // Calculate what would happen with advance allocation
    let advanceAllocation = null;
    if (orderAmount > 0 && currentBalance.currentBalance > 0) {
      const advanceUsed = Math.min(currentBalance.currentBalance, orderAmount);
      const balanceDue = orderAmount - advanceUsed;
      const finalBalance = currentBalance.currentBalance - orderAmount + advanceUsed;
      
      advanceAllocation = {
        advanceAvailable: currentBalance.currentBalance,
        orderAmount,
        advanceUsed,
        balanceDue,
        finalBalance,
        message: `Customer has ${currentBalance.currentBalance} PKR advance. For ${orderAmount} PKR order: ${advanceUsed} PKR advance used, ${balanceDue} PKR due. Final balance: ${finalBalance} PKR`
      };
    }

    // Manual calculation for verification
    let manualCalculation = {
      totalCredits: 0,
      totalDebits: 0,
      advanceAllocations: 0,
      effectiveDebits: 0,
      calculatedBalance: 0
    };

    transactions.forEach((txn: any) => {
      if (txn.type === 'sale') {
        manualCalculation.totalDebits += txn.debit || 0;
      } else if (txn.type === 'payment') {
        manualCalculation.totalCredits += txn.credit || 0;
      } else if (txn.type === 'advance' && txn.credit > 0) {
        manualCalculation.totalCredits += txn.credit || 0;
      } else if (txn.type === 'advance' && txn.debit > 0) {
        manualCalculation.advanceAllocations += txn.debit || 0;
      }
    });

    manualCalculation.effectiveDebits = manualCalculation.totalDebits - manualCalculation.advanceAllocations;
    manualCalculation.calculatedBalance = manualCalculation.totalCredits - manualCalculation.effectiveDebits;

    return NextResponse.json({
      success: true,
      data: {
        customer: {
          id: customer._id,
          name: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone
        },
        currentBalance: {
          ...currentBalance,
          formattedBalance: `${currentBalance.currentBalance >= 0 ? '+' : ''}${currentBalance.currentBalance} PKR`,
          status: currentBalance.currentBalance > 0 ? 'advance' : currentBalance.currentBalance < 0 ? 'owing' : 'balanced'
        },
        balanceAfterOrder,
        advanceAllocation,
        manualCalculation: {
          ...manualCalculation,
          formattedBalance: `${manualCalculation.calculatedBalance >= 0 ? '+' : ''}${manualCalculation.calculatedBalance} PKR`
        },
        transactions: transactions.map((txn: any) => ({
          date: txn.date,
          type: txn.type,
          method: txn.method,
          description: txn.description,
          credit: txn.credit,
          debit: txn.debit,
          runningBalance: txn.runningBalance
        })),
        interpretation: {
          positiveBalance: 'Customer has advance credit (you owe them money)',
          negativeBalance: 'Customer owes you money',
          zeroBalance: 'Customer account is balanced'
        }
      }
    });

  } catch (error) {
    console.error('Balance calculation test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
