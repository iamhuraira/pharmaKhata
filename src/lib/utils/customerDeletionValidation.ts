import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Order } from '@/lib/models/order';
import { LedgerTransaction } from '@/lib/models/ledger';
import { Role } from '@/lib/models/roles';

export interface CustomerDeletionValidation {
  canDelete: boolean;
  reasons: string[];
  summary: {
    totalOrders: number;
    pendingOrders: number;
    totalTransactions: number;
    currentBalance: number;
    hasOutstandingBalance: boolean;
  };
}

/**
 * Validates if a customer can be safely deleted
 * @param customerId - The customer's ID
 * @returns CustomerDeletionValidation object with validation results
 */
export async function validateCustomerDeletion(customerId: string): Promise<CustomerDeletionValidation> {
  try {
    await connectDB();
    
    const reasons: string[] = [];
    let canDelete = true;

    // Get customer role
    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
      return {
        canDelete: false,
        reasons: ['Customer role not found'],
        summary: {
          totalOrders: 0,
          pendingOrders: 0,
          totalTransactions: 0,
          currentBalance: 0,
          hasOutstandingBalance: false
        }
      };
    }

    // Check if customer exists
    const customer = await User.findOne({ 
      _id: customerId, 
      role: customerRole._id 
    });

    if (!customer) {
      return {
        canDelete: false,
        reasons: ['Customer not found'],
        summary: {
          totalOrders: 0,
          pendingOrders: 0,
          totalTransactions: 0,
          currentBalance: 0,
          hasOutstandingBalance: false
        }
      };
    }

    // Check if customer is already deleted/inactive
    if (String(customer.status) === 'inactive' || String(customer.status) === 'deleted') {
      return {
        canDelete: false,
        reasons: ['Customer is already deactivated'],
        summary: {
          totalOrders: 0,
          pendingOrders: 0,
          totalTransactions: 0,
          currentBalance: 0,
          hasOutstandingBalance: false
        }
      };
    }

    // Count total orders
    const totalOrders = await (Order as any).countDocuments({
      'customer.id': customerId
    });

    // Count pending orders (not completed or cancelled)
    const pendingOrders = await (Order as any).countDocuments({
      'customer.id': customerId,
      status: { $nin: ['completed', 'cancelled'] }
    });

    // Count total transactions
    const totalTransactions = await (LedgerTransaction as any).countDocuments({
      'ref.customerId': customerId
    });

    // Get current balance
    const currentBalance = customer.balance || 0;
    const hasOutstandingBalance = Math.abs(currentBalance) > 0.01; // Consider balance > 1 paisa as outstanding

    // Validation rules
    if (pendingOrders > 0) {
      canDelete = false;
      reasons.push(`Customer has ${pendingOrders} pending orders that must be completed or cancelled first`);
    }

    if (hasOutstandingBalance) {
      canDelete = false;
      reasons.push(`Customer has outstanding balance of ${currentBalance.toFixed(2)} PKR that must be settled first`);
    }

    // Optional: Check for recent transactions (within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTransactions = await (LedgerTransaction as any).countDocuments({
      'ref.customerId': customerId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    if (recentTransactions > 0) {
      reasons.push(`Customer has ${recentTransactions} transactions in the last 30 days`);
    }

    return {
      canDelete,
      reasons,
      summary: {
        totalOrders,
        pendingOrders,
        totalTransactions,
        currentBalance,
        hasOutstandingBalance
      }
    };

  } catch (error) {
    console.error('Error validating customer deletion:', error);
    return {
      canDelete: false,
      reasons: ['Error occurred during validation'],
      summary: {
        totalOrders: 0,
        pendingOrders: 0,
        totalTransactions: 0,
        currentBalance: 0,
        hasOutstandingBalance: false
      }
    };
  }
}

/**
 * Get detailed information about customer's related data
 * @param customerId - The customer's ID
 * @returns Detailed information about customer's orders and transactions
 */
export async function getCustomerDeletionDetails(customerId: string) {
  try {
    await connectDB();

    // Get recent orders
    const recentOrders = await (Order as any).find({
      'customer.id': customerId
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('orderId status totals.grandTotal totals.balance createdAt')
    .lean();

    // Get recent transactions
    const recentTransactions = await (LedgerTransaction as any).find({
      'ref.customerId': customerId
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('type method description credit debit date')
    .lean();

    return {
      recentOrders,
      recentTransactions
    };
  } catch (error) {
    console.error('Error getting customer deletion details:', error);
    return {
      recentOrders: [],
      recentTransactions: []
    };
  }
}
