import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Order } from '@/lib/models/order';
import { LedgerTransaction } from '@/lib/models/ledger';
import { Role } from '@/lib/models/roles';

export interface TransactionHandlingOptions {
  strategy: 'preserve' | 'soft_delete' | 'hard_delete' | 'archive';
  updateReferences?: boolean;
  archiveToCustomer?: string; // ID of customer to transfer transactions to
}

export interface CustomerDeletionResult {
  success: boolean;
  customerDeleted: boolean;
  transactionsHandled: number;
  ordersHandled: number;
  strategy: string;
  details: {
    transactionsDeleted?: number;
    transactionsArchived?: number;
    transactionsUpdated?: number;
    ordersDeleted?: number;
    ordersArchived?: number;
    ordersUpdated?: number;
  };
}

/**
 * Handle customer transactions based on selected strategy
 * @param customerId - The customer's ID
 * @param options - Transaction handling options
 * @returns CustomerDeletionResult with details of what was done
 */
export async function handleCustomerTransactions(
  customerId: string, 
  options: TransactionHandlingOptions
): Promise<CustomerDeletionResult> {
  try {
    await connectDB();
    
    const result: CustomerDeletionResult = {
      success: false,
      customerDeleted: false,
      transactionsHandled: 0,
      ordersHandled: 0,
      strategy: options.strategy,
      details: {}
    };

    // Get customer role
    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
      throw new Error('Customer role not found');
    }

    // Get customer info
    const customer = await User.findOne({ 
      _id: customerId, 
      role: customerRole._id 
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Count existing transactions and orders
    const totalTransactions = await (LedgerTransaction as any).countDocuments({
      'ref.customerId': customerId
    });

    const totalOrders = await (Order as any).countDocuments({
      'customer.id': customerId
    });

    result.transactionsHandled = totalTransactions;
    result.ordersHandled = totalOrders;

    switch (options.strategy) {
      case 'preserve':
        // Do nothing - keep all transactions as-is
        console.log(`📋 Preserving ${totalTransactions} transactions and ${totalOrders} orders for customer ${customerId}`);
        result.details.transactionsUpdated = 0;
        result.details.ordersUpdated = 0;
        break;

      case 'soft_delete':
        // Mark transactions as deleted but keep them
        await (LedgerTransaction as any).updateMany(
          { 'ref.customerId': customerId },
          { 
            $set: { 
              deletedAt: new Date(),
              deletedBy: 'system',
              status: 'deleted'
            }
          }
        );

        await (Order as any).updateMany(
          { 'customer.id': customerId },
          { 
            $set: { 
              deletedAt: new Date(),
              deletedBy: 'system',
              status: 'cancelled'
            }
          }
        );

        console.log(`🗑️ Soft deleted ${totalTransactions} transactions and ${totalOrders} orders for customer ${customerId}`);
        result.details.transactionsUpdated = totalTransactions;
        result.details.ordersUpdated = totalOrders;
        break;

      case 'hard_delete':
        // Permanently delete transactions and orders
        await (LedgerTransaction as any).deleteMany({
          'ref.customerId': customerId
        });

        await (Order as any).deleteMany({
          'customer.id': customerId
        });

        console.log(`💥 Hard deleted ${totalTransactions} transactions and ${totalOrders} orders for customer ${customerId}`);
        result.details.transactionsDeleted = totalTransactions;
        result.details.ordersDeleted = totalOrders;
        break;

      case 'archive':
        // Transfer transactions to another customer (archive)
        if (!options.archiveToCustomer) {
          throw new Error('Archive customer ID is required for archive strategy');
        }

        // Verify archive customer exists
        const archiveCustomer = await User.findOne({ 
          _id: options.archiveToCustomer, 
          role: customerRole._id 
        });

        if (!archiveCustomer) {
          throw new Error('Archive customer not found');
        }

        // Update transaction references
        await (LedgerTransaction as any).updateMany(
          { 'ref.customerId': customerId },
          { 
            $set: { 
              'ref.customerId': options.archiveToCustomer,
              'ref.originalCustomerId': customerId,
              'ref.archivedAt': new Date(),
              'ref.archivedBy': 'system'
            }
          }
        );

        // Update order references
        await (Order as any).updateMany(
          { 'customer.id': customerId },
          { 
            $set: { 
              'customer.id': options.archiveToCustomer,
              'customer.originalId': customerId,
              'customer.archivedAt': new Date(),
              'customer.archivedBy': 'system'
            }
          }
        );

        console.log(`📦 Archived ${totalTransactions} transactions and ${totalOrders} orders from customer ${customerId} to ${options.archiveToCustomer}`);
        result.details.transactionsArchived = totalTransactions;
        result.details.ordersArchived = totalOrders;
        break;

      default:
        throw new Error(`Unknown transaction handling strategy: ${options.strategy}`);
    }

    result.success = true;
    return result;

  } catch (error) {
    console.error('Error handling customer transactions:', error);
    return {
      success: false,
      customerDeleted: false,
      transactionsHandled: 0,
      ordersHandled: 0,
      strategy: options.strategy,
      details: {}
    };
  }
}

/**
 * Get available transaction handling strategies for a customer
 * @param customerId - The customer's ID
 * @returns Array of available strategies with descriptions
 */
export async function getAvailableTransactionStrategies(customerId: string) {
  try {
    await connectDB();

    const totalTransactions = await (LedgerTransaction as any).countDocuments({
      'ref.customerId': customerId
    });

    const totalOrders = await (Order as any).countDocuments({
      'customer.id': customerId
    });

    const strategies = [
      {
        id: 'preserve',
        name: 'Preserve All Data',
        description: 'Keep all transactions and orders as-is. Customer is marked as inactive but data remains accessible.',
        recommended: totalTransactions === 0 && totalOrders === 0,
        warning: null
      },
      {
        id: 'soft_delete',
        name: 'Soft Delete (Recommended)',
        description: 'Mark transactions and orders as deleted but keep them in database for audit purposes.',
        recommended: totalTransactions > 0 || totalOrders > 0,
        warning: null
      },
      {
        id: 'hard_delete',
        name: 'Hard Delete (Dangerous)',
        description: 'Permanently delete all transactions and orders. This action cannot be undone!',
        recommended: false,
        warning: 'This will permanently delete all customer data and cannot be undone!'
      },
      {
        id: 'archive',
        name: 'Archive to Another Customer',
        description: 'Transfer all transactions and orders to another customer account.',
        recommended: false,
        warning: 'Requires selecting another customer to transfer data to.'
      }
    ];

    return strategies;

  } catch (error) {
    console.error('Error getting transaction strategies:', error);
    return [];
  }
}

/**
 * Get customers that can be used for archiving transactions
 * @param excludeCustomerId - Customer ID to exclude from results
 * @returns Array of customers suitable for archiving
 */
export async function getArchiveCustomers(excludeCustomerId: string) {
  try {
    await connectDB();

    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
      return [];
    }

    const customers = await User.find({
      _id: { $ne: excludeCustomerId },
      role: customerRole._id,
      status: 'active'
    })
    .select('firstName lastName phone email')
    .sort({ firstName: 1, lastName: 1 })
    .lean();

    return customers.map(customer => ({
      id: customer._id,
      name: `${customer.firstName} ${customer.lastName}`,
      phone: customer.phone,
      email: customer.email
    }));

  } catch (error) {
    console.error('Error getting archive customers:', error);
    return [];
  }
}
