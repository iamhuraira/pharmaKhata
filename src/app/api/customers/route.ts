import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';
import { UserStatus } from '@/lib/constants/enums';
import { LedgerTransaction } from '@/lib/models/ledger';
import { updateCustomerBalance } from '@/lib/utils/customerBalance';
import { validateCustomerPhone } from '@/lib/utils/phoneValidation';
// import bcrypt from 'bcrypt'; // Not used in this file

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
      whatsappNumber,
      email,
      address,
      creditLimit,
      // hasAdvance, // Not used in current implementation
      advance,
      debt
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !phone) {
      return NextResponse.json({
        success: false,
        message: 'First name, last name, and phone are required'
      }, { status: 400 });
    }

    // Validate phone number format and uniqueness for customers
    const phoneValidation = await validateCustomerPhone(phone);
    if (!phoneValidation.isValid) {
      return NextResponse.json({
        success: false,
        message: phoneValidation.message || 'Invalid phone number'
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
    if (address) {
      if (typeof address === 'string') {
        // Handle legacy string format
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
      } else if (typeof address === 'object' && address !== null) {
        // Handle structured address object from frontend
        currentAddress = {
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          country: address.country || 'Pakistan'
        };
      }
    }

    console.log('🔍 API - Received address:', address);
    console.log('🔍 API - Parsed currentAddress:', currentAddress);

    // Create customer with initial balance
    const customer = new User({
      firstName,
      lastName,
      phone,
      whatsappNumber: whatsappNumber || undefined, // Add WhatsApp number field
      email: email || undefined, // Add email field
      password: 'defaultPassword123', // Set a default password
      role: customerRole._id,
      status: 'active',
      balance: 0, // Start with zero balance
      currentAddress: currentAddress // Save parsed address
    });

    console.log('🔍 API - Customer object before save:', customer);
    console.log('🔍 API - currentAddress being saved:', currentAddress);

    await customer.save();

    console.log('🔍 API - Customer saved successfully');
    console.log('🔍 API - Saved customer data:', {
      id: customer._id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      currentAddress: (customer as any).currentAddress,
      balance: customer.balance
    });

    // Handle advance payment and debt
    let finalBalance = 0;
    
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
      console.log(`🔍 Advance ledger transaction saved: ${ledgerTransaction._id}`);

      // Update customer balance directly
      finalBalance = await updateCustomerBalance(customer._id.toString(), advance.amount, 'advance_payment');
      console.log(`🔍 Balance updated to: ${finalBalance} PKR`);
    }
    
    if (debt && debt.amount > 0) {
      console.log(`🔍 Creating customer with debt: ${debt.amount} PKR`);
      
      const debtTransaction = new LedgerTransaction({
        date: debt.date ? new Date(debt.date) : new Date(),
        type: 'sale', // Debt is treated as a sale (customer owes)
        method: debt.method || 'on_account',
        description: `Initial debt from ${firstName} ${lastName}`,
        ref: {
          customerId: customer._id,
          party: `${firstName} ${lastName}`,
          txnNo: debt.reference
        },
        debit: debt.amount, // Debt is DEBIT (customer owes money)
        credit: 0,          // No credit for debt
        runningBalance: 0 // Will be calculated by middleware
      });

      await debtTransaction.save();
      console.log(`🔍 Debt ledger transaction saved: ${debtTransaction._id}`);

      // Update customer balance (debt reduces balance)
      finalBalance = await updateCustomerBalance(customer._id.toString(), -debt.amount, 'initial_debt');
      console.log(`🔍 Final balance after debt: ${finalBalance} PKR`);
    }
    
    // If both advance and debt exist, calculate net balance
    if (advance && advance.amount > 0 && debt && debt.amount > 0) {
      const netAmount = advance.amount - debt.amount;
      finalBalance = await updateCustomerBalance(customer._id.toString(), netAmount, 'advance_debt_net');
      console.log(`🔍 Net balance (advance - debt): ${finalBalance} PKR`);
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
          whatsappNumber: customer.whatsappNumber || '',
          email: email || '',
          address: currentAddress ? `${currentAddress.street}, ${currentAddress.city}, ${currentAddress.state}, ${currentAddress.country}` : '',
          currentAddress: currentAddress, // Return the structured address
          balance: finalBalance,
          creditLimit: creditLimit || 0,
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
    } else {
      // By default, only show active customers (exclude inactive/deleted)
      filter.status = { $nin: [UserStatus.INACTIVE, UserStatus.DELETED] };
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
        .select('firstName lastName phone whatsappNumber email status role balance createdAt currentAddress')
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

      console.log(`🔍 Customer ${customer.firstName} ${customer.lastName} - currentAddress:`, customer.currentAddress);
      console.log(`🔍 Customer ${customer.firstName} ${customer.lastName} - formatted address:`, addressValue);

      return {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        whatsappNumber: customer.whatsappNumber || '',
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
