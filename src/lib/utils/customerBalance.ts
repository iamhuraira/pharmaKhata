import { LedgerTransaction } from '../models/ledger';
import { User } from '../models/user';

export interface CustomerBalanceInfo {
  currentBalance: number;
  totalDebits: number;
  totalCredits: number;
  totalSales: number;
  totalPayments: number;
  totalAdvances: number;
  totalAdvanceAllocations: number;
  effectiveDebits: number;
}

/**
 * Update customer balance directly in the database
 * This function should be called after every transaction that affects customer balance
 * @param customerId - The customer's ID
 * @param balanceChange - The change in balance (positive = credit, negative = debit)
 * @param transactionType - Type of transaction for logging
 * @returns Updated customer balance
 */
export async function updateCustomerBalance(
  customerId: string, 
  balanceChange: number, 
  transactionType: string
): Promise<number> {
  try {
    console.log(`🔍 Updating customer balance: ${customerId}, Change: ${balanceChange} PKR`);
    
    // First, get the current balance before update
    const beforeUpdate = await User.findById(customerId).select('balance');
    console.log(`🔍 Balance before update: ${beforeUpdate?.balance || 0}`);
    
    // Calculate the new balance
    const currentBalance = beforeUpdate?.balance || 0;
    const newBalance = currentBalance + balanceChange;
    console.log(`🔍 Current balance: ${currentBalance}, New balance: ${newBalance}`);
    
    // Update the balance using $set to ensure it works
    const updateResult = await User.findByIdAndUpdate(
      customerId,
      { $set: { balance: newBalance } },
      { new: true }
    );

    if (!updateResult) {
      throw new Error('Customer not found');
    }

    console.log(`🔍 Update result:`, updateResult);
    console.log(`🔍 Update result balance: ${updateResult.balance}`);

    // Verify the update by fetching the document again
    const verificationResult = await User.findById(customerId).select('balance');
    if (!verificationResult) {
      throw new Error('Failed to verify updated customer');
    }

    const verifiedBalance = verificationResult.balance || 0;
    console.log(`🔍 Verification result:`, verificationResult);
    console.log(`🔍 Verified balance: ${verifiedBalance}`);

    console.log(`🔍 Customer Balance Updated: ${customerId}`);
    console.log(`  - Transaction: ${transactionType}`);
    console.log(`  - Balance Change: ${balanceChange >= 0 ? '+' : ''}${balanceChange} PKR`);
    console.log(`  - New Balance: ${verifiedBalance} PKR`);

    return verifiedBalance;

  } catch (error) {
    console.error('Error updating customer balance:', error);
    throw new Error('Failed to update customer balance');
  }
}

/**
 * Get customer balance directly from the database
 * @param customerId - The customer's ID
 * @returns Current balance
 */
export async function getCustomerBalanceFromDB(customerId: string): Promise<number> {
  try {
    const customer = await User.findById(customerId).select('balance');
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer.balance || 0;
  } catch (error) {
    console.error('Error getting customer balance from DB:', error);
    return 0;
  }
}

/**
 * Recalculate customer balance from ledger transactions (for verification/repair)
 * @param customerId - The customer's ID
 * @returns Recalculated balance
 */
export async function recalculateCustomerBalanceFromLedger(customerId: string): Promise<number> {
  try {
    // Get all ledger transactions for this customer
    const transactions = await (LedgerTransaction as any).find({
      'ref.customerId': customerId
    })
    .sort({ date: 1, createdAt: 1 }) // Chronological order
    .lean();

    let runningBalance = 0;

    transactions.forEach((txn: any) => {
      if (txn.type === 'sale') {
        runningBalance -= txn.debit || 0; // Customer owes more
      } else if (txn.type === 'payment') {
        runningBalance += txn.credit || 0; // Customer pays
      } else if (txn.type === 'advance' && txn.credit > 0) {
        runningBalance += txn.credit || 0; // Customer gives advance
      }
    });

    // Update the customer balance in database
    await updateCustomerBalance(customerId, runningBalance - await getCustomerBalanceFromDB(customerId), 'recalculation');

    console.log(`🔍 Customer Balance Recalculated: ${customerId}`);
    console.log(`  - Ledger Balance: ${runningBalance} PKR`);
    console.log(`  - Database Balance: ${await getCustomerBalanceFromDB(customerId)} PKR`);

    return runningBalance;

  } catch (error) {
    console.error('Error recalculating customer balance:', error);
    throw new Error('Failed to recalculate customer balance');
  }
}

/**
 * Calculate customer balance from ledger transactions
 * @param customerId - The customer's ID
 * @returns CustomerBalanceInfo object with balance details
 */
export async function calculateCustomerBalance(customerId: string): Promise<CustomerBalanceInfo> {
  try {
    // Get all ledger transactions for this customer
    const transactions = await (LedgerTransaction as any).find({
      'ref.customerId': customerId
    })
    .sort({ date: -1, createdAt: -1 })
    .lean();

    let totalDebits = 0;   // Customer owes (sales, orders)
    let totalCredits = 0;  // Customer pays (payments, advance allocations)
    let totalSales = 0;    // Total sales/orders
    let totalPayments = 0; // Total payments received
    let totalAdvances = 0; // Total advance payments
    // let totalAdvanceAllocations = 0; // Total advance allocations to orders - not used

    transactions.forEach((txn: any) => {
      if (txn.type === 'sale') {
        totalDebits += txn.debit || 0;
        totalSales += txn.debit || 0;
      } else if (txn.type === 'payment') {
        totalCredits += txn.credit || 0;
        totalPayments += txn.credit || 0;
      } else if (txn.type === 'advance' && txn.credit > 0) {
        // Customer gives advance payment (CREDIT for you)
        totalCredits += txn.credit || 0;
        totalAdvances += txn.credit || 0;
      } else if (txn.type === 'advance' && txn.debit > 0) {
        // ❌ REMOVED: This was the problematic advance allocation transaction
        // Advance allocations are now handled internally based on order totals
        // No need to process these ledger transactions
      }
    });

    // Calculate current balance: 
    // Balance = (Payments + Advances) - Sales
    // Advance allocation is handled internally in the order totals
    const currentBalance = totalCredits - totalDebits;

    console.log(`🔍 Balance Calculation for customer ${customerId}:`);
    console.log(`  - Total Credits (Payments + Advances): ${totalCredits}`);
    console.log(`  - Total Debits (Sales): ${totalDebits}`);
    console.log(`  - Final Balance: ${currentBalance}`);
    console.log(`  - Customer owes: ${Math.abs(Math.min(0, currentBalance))} PKR`);
    console.log(`  - Customer has advance: ${Math.max(0, currentBalance)} PKR`);

    return {
      currentBalance,
      totalDebits,
      totalCredits,
      totalSales,
      totalPayments,
      totalAdvances,
      totalAdvanceAllocations: 0, // No more advance allocation transactions
      effectiveDebits: totalDebits // Effective debits = total debits (no allocations)
    };

  } catch (error) {
    console.error('Error calculating customer balance:', error);
    throw new Error('Failed to calculate customer balance');
  }
}

/**
 * Get customer balance summary for display
 * @param customerId - The customer's ID
 * @returns Formatted balance information
 */
export async function getCustomerBalanceSummary(customerId: string) {
  try {
    const balanceInfo = await calculateCustomerBalance(customerId);
    
    const isPositive = balanceInfo.currentBalance > 0;
    const isZero = balanceInfo.currentBalance === 0;
    const isNegative = balanceInfo.currentBalance < 0;
    
    let status = 'balanced';
    let message = 'Customer account is balanced';
    
    if (isPositive) {
      status = 'advance';
      message = `Customer has advance of ${Math.abs(balanceInfo.currentBalance)} PKR`;
    } else if (isNegative) {
      status = 'owing';
      message = `Customer owes ${Math.abs(balanceInfo.currentBalance)} PKR`;
    }

    return {
      ...balanceInfo,
      status,
      message,
      isPositive,
      isZero,
      isNegative,
      formattedBalance: `${isNegative ? '-' : ''}${Math.abs(balanceInfo.currentBalance)} PKR`
    };

  } catch (error) {
    console.error('Error getting customer balance summary:', error);
    return {
      currentBalance: 0,
      totalDebits: 0,
      totalCredits: 0,
      totalSales: 0,
      totalPayments: 0,
      totalAdvances: 0,
      totalAdvanceAllocations: 0,
      effectiveDebits: 0,
      status: 'error',
      message: 'Failed to calculate balance',
      isPositive: false,
      isZero: true,
      isNegative: false,
      formattedBalance: '0 PKR'
    };
  }
}

/**
 * Calculate what customer will owe after a new order
 * @param customerId - The customer's ID
 * @param orderAmount - The amount of the new order
 * @returns Balance information after the order
 */
export async function calculateBalanceAfterOrder(customerId: string, orderAmount: number) {
  try {
    const currentBalance = await calculateCustomerBalance(customerId);
    const balanceAfterOrder = currentBalance.currentBalance - orderAmount;
    
    return {
      beforeOrder: currentBalance.currentBalance,
      afterOrder: balanceAfterOrder,
      orderAmount,
      willOwe: balanceAfterOrder < 0 ? Math.abs(balanceAfterOrder) : 0,
      willHaveAdvance: balanceAfterOrder > 0 ? balanceAfterOrder : 0,
      message: balanceAfterOrder < 0 
        ? `Customer will owe ${Math.abs(balanceAfterOrder)} PKR after this order`
        : `Customer will have advance of ${balanceAfterOrder} PKR after this order`
    };

  } catch (error) {
    console.error('Error calculating balance after order:', error);
    throw new Error('Failed to calculate balance after order');
  }
}
