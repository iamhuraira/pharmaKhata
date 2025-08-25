import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';
import { LedgerTransaction } from '@/lib/models/ledger';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
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

    // Get all ledger transactions for this customer
    const transactions = await (LedgerTransaction as any).find({
      'ref.customerId': customerId
    })
    .sort({ date: 1, createdAt: 1 }) // Chronological order
    .lean();

    // Simulate the scenario step by step
    let runningBalance = 0;
    const scenarioSteps = [];

    transactions.forEach((txn: any, index: number) => {
      let stepDescription = '';
      let balanceChange = 0;

      if (txn.type === 'advance' && txn.credit > 0) {
        // Customer gives advance
        balanceChange = txn.credit;
        runningBalance += balanceChange;
        stepDescription = `Customer gives advance: +${txn.credit} PKR`;
      } else if (txn.type === 'sale') {
        // Customer creates order
        balanceChange = -txn.debit;
        runningBalance += balanceChange;
        stepDescription = `Customer creates order: -${txn.debit} PKR`;
      } else if (txn.type === 'advance' && txn.debit > 0) {
        // Advance allocation to order
        balanceChange = txn.debit;
        runningBalance += balanceChange;
        stepDescription = `Advance allocated to order: +${txn.debit} PKR`;
      } else if (txn.type === 'payment') {
        // Customer makes payment
        balanceChange = txn.credit;
        runningBalance += balanceChange;
        stepDescription = `Customer payment: +${txn.credit} PKR`;
      }

      scenarioSteps.push({
        step: index + 1,
        transaction: txn,
        description: stepDescription,
        balanceChange: `${balanceChange >= 0 ? '+' : ''}${balanceChange} PKR`,
        runningBalance: `${runningBalance >= 0 ? '+' : ''}${runningBalance} PKR`,
        explanation: `After this transaction, customer ${runningBalance >= 0 ? 'has advance of' : 'owes'} ${Math.abs(runningBalance)} PKR`
      });
    });

    // Calculate final balance using our utility function
    let totalCredits = 0;
    let totalDebits = 0;
    let advanceAllocations = 0;

    transactions.forEach((txn: any) => {
      if (txn.type === 'sale') {
        totalDebits += txn.debit || 0;
      } else if (txn.type === 'payment') {
        totalCredits += txn.credit || 0;
      } else if (txn.type === 'advance' && txn.credit > 0) {
        totalCredits += txn.credit || 0;
      } else if (txn.type === 'advance' && txn.debit > 0) {
        advanceAllocations += txn.debit || 0;
      }
    });

    const effectiveDebits = totalDebits - advanceAllocations;
    const calculatedBalance = totalCredits - effectiveDebits;

    return NextResponse.json({
      success: true,
      data: {
        customer: {
          id: customer._id,
          name: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone
        },
        scenario: {
          description: "Customer gives 2000 PKR advance, creates 5000 PKR order, advance allocated to order",
          expectedFinalBalance: "-1,000 PKR (customer owes 1,000 PKR)",
          actualFinalBalance: `${calculatedBalance >= 0 ? '+' : ''}${calculatedBalance} PKR`
        },
        stepByStep: scenarioSteps,
        summary: {
          totalCredits,
          totalDebits,
          advanceAllocations,
          effectiveDebits,
          calculatedBalance,
          runningBalance,
          isCorrect: calculatedBalance === -1000
        },
        transactions: transactions.map((txn: any) => ({
          date: txn.date,
          type: txn.type,
          method: txn.method,
          description: txn.description,
          credit: txn.credit,
          debit: txn.debit,
          runningBalance: txn.runningBalance
        }))
      }
    });

  } catch (error) {
    console.error('Scenario test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
