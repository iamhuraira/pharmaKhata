import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    User && Role;
    
    const { id: customerId } = await params;
    
    // Validate customer exists
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
    }).select('-password');
    
    if (!customer) {
      return NextResponse.json({
        success: false,
        message: 'Customer not found'
      }, { status: 404 });
    }

    // Map customer to expected format
    const mappedCustomer = {
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
    };

    return NextResponse.json({
      success: true,
      data: {
        customer: mappedCustomer
      }
    });

  } catch (error) {
    console.error('Get customer error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    User && Role;
    
    const { id: customerId } = await params;
    const body = await _request.json();
    
    const {
      firstName,
      lastName,
      phone
    } = body;

    // Validate customer exists
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

    // Update customer
    const updatedCustomer = await User.findByIdAndUpdate(
      customerId,
      {
        firstName,
        lastName,
        phone
      },
      { new: true }
    ).select('-password');

    // Map customer to expected format
    const mappedCustomer = {
      id: updatedCustomer!._id,
      firstName: updatedCustomer!.firstName,
      lastName: updatedCustomer!.lastName,
      phone: updatedCustomer!.phone,
      email: '', // Default value since it's not in User model
      address: {}, // Default empty address
      balance: 0, // Will be calculated from transactions
      creditLimit: 0, // Default value
      status: updatedCustomer!.status,
      createdAt: updatedCustomer!.createdAt,
      updatedAt: updatedCustomer!.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: {
        customer: mappedCustomer
      },
      message: 'Customer updated successfully'
    });

  } catch (error) {
    console.error('Update customer error:', error);
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
    
    // Ensure all models are registered
    User && Role;
    
    const { id: customerId } = await params;

    // Validate customer exists
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

    // Soft delete by updating status
    await User.findByIdAndUpdate(customerId, {
      status: 'deleted'
    });

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Delete customer error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
