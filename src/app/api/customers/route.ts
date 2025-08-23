import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';
import { LedgerTransaction } from '@/lib/models/ledger';
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
      advance
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !phone) {
      return NextResponse.json({
        success: false,
        message: 'First name, last name, and phone are required'
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

    // Check if customer already exists
    const existingCustomer = await User.findOne({ 
      phone: phone,
      role: customerRole._id 
    });
    
    if (existingCustomer) {
      return NextResponse.json({
        success: false,
        message: 'Customer with this phone number already exists'
      }, { status: 409 });
    }

    // Create customer
    const hashedPassword = await bcrypt.hash('Customer123!', 10);
    
    const customer = new User({
      firstName,
      lastName,
      phone,
      password: hashedPassword,
      role: customerRole._id
    });

    await customer.save();

    // If advance payment, create ledger transaction
    if (advance && advance.amount > 0) {
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
        credit: 0,
        debit: advance.amount, // Advance payment is debit (customer pays you)
        runningBalance: 0 // Will be calculated by middleware
      });

      await ledgerTransaction.save();
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
          email: '', // Default value since it's not in User model
          address: {}, // Default empty address
          balance: 0, // Will be calculated from transactions
          creditLimit: 0, // Default value
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
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get customer role
    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
      return NextResponse.json({
        success: false,
        message: 'Customer role not found'
      }, { status: 404 });
    }

    // Build filter
    const filter: any = { role: customerRole._id };
    
    if (q) {
      filter.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ];
    }

    // Execute query
    const skip = (page - 1) * limit;
    
    const [customers, total] = await Promise.all([
      (User as any).find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password')
        .lean(),
      (User as any).countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    // Map customers to expected format
    const mappedCustomers = customers.map((customer: any) => ({
      id: customer._id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: '', // Default value since it's not in User model
      address: {}, // Default empty address
      balance: 0, // Will be calculated from transactions
      creditLimit: 0, // Default value
      status: customer.status,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        customers: mappedCustomers,
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
