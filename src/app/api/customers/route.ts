import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';
import { LedgerTransaction } from '@/lib/models/ledger';
import { updateCustomerBalance } from '@/lib/utils/customerBalance';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    User && Role && LedgerTransaction;
    
    const body = await request.json();
    
    const {
      firstName,
      lastName,
      phone,
      email,
      address,
      creditLimit,
      hasAdvance,
      advance
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !phone) {
      return NextResponse.json({
        success: false,
        message: 'First name, last name, and phone are required'
      }, { status: 400 });
    }

    // Check if customer already exists
    const existingCustomer = await User.findOne({ phone });
    if (existingCustomer) {
      return NextResponse.json({
        success: false,
        message: 'Customer with this phone number already exists'
      }, { status: 400 });
    }

    // Get customer role
    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
      return NextResponse.json({
        success: false,
        message: 'Customer role not found'
      }, { status: 404 });
    }

    // Parse address string into structured format
    let currentAddress = undefined;
    if (address && typeof address === 'string') {
      // Simple parsing - split by comma and assign to fields
      const addressParts = address.split(',').map(part => part.trim());
      if (addressParts.length >= 3) {
        currentAddress = {
          street: addressParts[0] || '',
          city: addressParts[1] || '',
          state: addressParts[2] || '',
          country: addressParts[3] || 'Pakistan' // Default country
        };
      } else if (addressParts.length === 1) {
        // Single part address - treat as street
        currentAddress = {
          street: addressParts[0] || '',
          city: 'Unknown',
          state: 'Unknown',
          country: 'Pakistan'
        };
      }
    }

    // Create customer with initial balance
    const customer = new User({
      firstName,
      lastName,
      phone,
      password: 'defaultPassword123', // Set a default password
      role: customerRole._id,
      status: 'active',
      balance: 0, // Start with zero balance
      currentAddress: currentAddress // Save parsed address
    });

    await customer.save();

    // If advance payment, create ledger transaction and update balance
    if (advance && advance.amount > 0) {
      console.log(`🔍 Creating customer with advance: ${advance.amount} PKR`);
      console.log(`🔍 Initial customer balance: ${customer.balance}`);
      
      const ledgerTransaction = new LedgerTransaction({
        date: advance.date ? new Date(advance.date) : new Date(),
        type: 'advance',
        method: advance.method || 'cash',
        description: `Advance from ${firstName} ${lastName}`,
        ref: {
          customerId: customer._id,
          party: `${firstName} ${lastName}`,
          txnNo: advance.reference
        },
        credit: advance.amount, // Advance payment is CREDIT (you receive money)
        debit: 0,               // No debit for advance payment
        runningBalance: 0 // Will be calculated by middleware
      });

      await ledgerTransaction.save();
      console.log(`🔍 Ledger transaction saved: ${ledgerTransaction._id}`);

      // Update customer balance directly
      const updatedBalance = await updateCustomerBalance(customer._id.toString(), advance.amount, 'advance_payment');
      console.log(`🔍 Balance updated to: ${updatedBalance} PKR`);
      
      // Use the updated balance value directly
      const finalBalance = updatedBalance;
      console.log(`🔍 Final balance to return: ${finalBalance}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        customerId: customer._id,
        customer: {
          id: customer._id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          email: email || '', // Default value since it's not in User model
          address: address || {}, // Default empty address
          balance: advance && advance.amount > 0 ? (advance.amount) : 0, // Use advance amount or 0
          creditLimit: creditLimit || 0, // Default value
          status: customer.status
        }
      },
      message: 'Customer created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    User && Role;
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    // Get customer role first
    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
      return NextResponse.json({
        success: false,
        message: 'Customer role not found'
      }, { status: 404 });
    }

    // Build filter - ALWAYS filter by customer role
    const filter: any = { role: customerRole._id };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query
    const skip = (page - 1) * limit;
    
    const [customers, total] = await Promise.all([
      (User as any).find(filter)
        .populate('role', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('firstName lastName phone email status role balance createdAt currentAddress')
        .lean(),
      (User as any).countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    // Format customer data with balance information
    const formattedCustomers = customers.map((customer: any) => {
      // Format address
      let addressValue = '';
      if (customer.currentAddress) {
        if (typeof customer.currentAddress === 'string') {
          addressValue = customer.currentAddress;
        } else if (customer.currentAddress.street) {
          const parts = [customer.currentAddress.street, customer.currentAddress.city, customer.currentAddress.state];
          if (customer.currentAddress.country && customer.currentAddress.country !== 'Pakistan') {
            parts.push(customer.currentAddress.country);
          }
          addressValue = parts.join(', ');
        }
      }

      return {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email || '',
        status: customer.status,
        role: customer.role?.name || 'customer',
        balance: customer.balance || 0,
        balanceStatus: customer.balance > 0 ? 'advance' : customer.balance < 0 ? 'owing' : 'balanced',
        formattedBalance: `${customer.balance >= 0 ? '+' : ''}${customer.balance} PKR`,
        address: addressValue,
        createdAt: customer.createdAt
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        customers: formattedCustomers,
        pagination: {
          currentPage: page,
          totalPages,
          totalCustomers: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
