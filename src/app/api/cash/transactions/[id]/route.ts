import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LedgerTransaction } from '@/lib/models/ledger';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Ensure model is registered
    LedgerTransaction;
    
    const { id: transactionId } = await params;
    
    const transaction = await (LedgerTransaction as any).findById(transactionId).lean();
    
    if (!transaction) {
      return NextResponse.json({
        success: false,
        message: 'Transaction not found'
      }, { status: 404 });
    }

    // Map transaction to frontend format
    const mappedTransaction = {
      id: transaction._id,
      txnId: transaction.txnId,
      date: transaction.date,
      type: transaction.type,
      method: transaction.method,
      description: transaction.description,
      ref: transaction.ref,
      credit: transaction.credit || 0,
      debit: transaction.debit || 0,
      runningBalance: transaction.runningBalance || 0
    };

    return NextResponse.json({
      success: true,
      data: {
        transaction: mappedTransaction
      }
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Ensure model is registered
    LedgerTransaction;
    
    const { id: transactionId } = await params;
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

    // Validate that exactly one of credit or debit is > 0
    if ((credit > 0 && debit > 0) || (credit === 0 && debit === 0)) {
      return NextResponse.json({
        success: false,
        message: 'Exactly one of credit or debit must be greater than 0'
      }, { status: 400 });
    }

    // Get current transaction
    const currentTransaction = await (LedgerTransaction as any).findById(transactionId);
    if (!currentTransaction) {
      return NextResponse.json({
        success: false,
        message: 'Transaction not found'
      }, { status: 404 });
    }

    // Calculate new running balance
    const oldNetAmount = (currentTransaction.credit || 0) - (currentTransaction.debit || 0);
    const newNetAmount = (credit || 0) - (debit || 0);
    const balanceDifference = newNetAmount - oldNetAmount;

    // Update transaction
    const updatedTransaction = await (LedgerTransaction as any).findByIdAndUpdate(
      transactionId,
      {
        date: date ? new Date(date) : currentTransaction.date,
        type: type || currentTransaction.type,
        method: method || currentTransaction.method,
        description: description || currentTransaction.description,
        ref: ref || currentTransaction.ref,
        credit: credit !== undefined ? credit : currentTransaction.credit,
        debit: debit !== undefined ? debit : currentTransaction.debit
      },
      { new: true }
    ).lean();

    // Update running balances for all subsequent transactions
    if (balanceDifference !== 0) {
      await (LedgerTransaction as any).updateMany(
        {
          $or: [
            { date: { $gt: updatedTransaction.date } },
            { 
              date: updatedTransaction.date, 
              createdAt: { $gt: updatedTransaction.createdAt } 
            }
          ]
        },
        {
          $inc: { runningBalance: balanceDifference }
        }
      );
    }

    // Map transaction to frontend format
    const mappedTransaction = {
      id: updatedTransaction._id,
      txnId: updatedTransaction.txnId,
      date: updatedTransaction.date,
      type: updatedTransaction.type,
      method: updatedTransaction.method,
      description: updatedTransaction.description,
      ref: updatedTransaction.ref,
      credit: updatedTransaction.credit || 0,
      debit: updatedTransaction.debit || 0,
      runningBalance: updatedTransaction.runningBalance || 0
    };

    return NextResponse.json({
      success: true,
      data: {
        transaction: mappedTransaction
      },
      message: 'Transaction updated successfully'
    });

  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Ensure model is registered
    LedgerTransaction;
    
    const { id: transactionId } = await params;

    // Get current transaction
    const currentTransaction = await (LedgerTransaction as any).findById(transactionId);
    if (!currentTransaction) {
      return NextResponse.json({
        success: false,
        message: 'Transaction not found'
      }, { status: 404 });
    }

    // Calculate balance adjustment
    const balanceAdjustment = (currentTransaction.credit || 0) - (currentTransaction.debit || 0);

    // Delete transaction
    await (LedgerTransaction as any).findByIdAndDelete(transactionId);

    // Update running balances for all subsequent transactions
    if (balanceAdjustment !== 0) {
      await (LedgerTransaction as any).updateMany(
        {
          $or: [
            { date: { $gt: currentTransaction.date } },
            { 
              date: currentTransaction.date, 
              createdAt: { $gt: currentTransaction.createdAt } 
            }
          ]
        },
        {
          $inc: { runningBalance: -balanceAdjustment }
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
