import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';
import { UserStatus } from '@/lib/constants/enums';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    User && Role;
    
    const { id } = await params;

    // Get customer role
    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
      return NextResponse.json({
        success: false,
        message: 'Customer role not found'
      }, { status: 404 });
    }

    // Find customer by ID and role
    const customer = await User.findOne({ 
      _id: id, 
      role: customerRole._id 
    }).select('firstName lastName phone email status role balance createdAt updatedAt currentAddress deletedAt deletedBy');

    if (!customer) {
      return NextResponse.json({
        success: false,
        message: 'Customer not found'
      }, { status: 404 });
    }

    // Check if customer is inactive
    if ((customer.status as string) === 'inactive' || (customer.status as string) === 'deleted') {
      return NextResponse.json({
        success: false,
        message: 'Customer has been deactivated',
        data: {
          customer: {
            id: customer._id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            status: customer.status,
            deletedAt: (customer as any).deletedAt,
            deletedBy: (customer as any).deletedBy
          }
        }
      }, { status: 410 }); // 410 Gone - resource no longer available
    }

    console.log('🔍 API - Raw customer from DB:', customer);
    console.log('🔍 API - currentAddress from DB:', (customer as any).currentAddress);
    console.log('🔍 API - customer keys:', Object.keys(customer));

    // Handle address field - convert from AddressSchema to string or object
    let addressValue = '';
    const currentAddress = (customer as any).currentAddress;
    if (currentAddress) {
      if (typeof currentAddress === 'string') {
        addressValue = currentAddress;
      } else if (currentAddress.street) {
        const parts = [currentAddress.street, currentAddress.city, currentAddress.state];
        if (currentAddress.country && currentAddress.country !== 'Pakistan') {
          parts.push(currentAddress.country);
        }
        addressValue = parts.join(', ');
      }
    }

    console.log('🔍 API - Parsed addressValue:', addressValue);
    console.log('🔍 API - Final currentAddress to return:', currentAddress);

    return NextResponse.json({
      success: true,
      data: {
        customer: {
          id: customer._id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          email: customer.email || '',
          status: customer.status,
          role: customer.role,
          balance: customer.balance || 0,
          address: addressValue,
          currentAddress: (customer as any).currentAddress, // Also return the structured address
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get customer by ID error:', error);
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

    // Soft delete by updating status to inactive
    const updatedCustomer = await User.findByIdAndUpdate(
      customerId,
      {
        status: UserStatus.INACTIVE,
        deletedAt: new Date(), // Track when customer was deactivated
        deletedBy: 'system' // You can add user ID here if implementing user tracking
      },
      { new: true }
    ).select('-password');

    console.log(`🔍 Customer ${customerId} deactivated successfully`);

    return NextResponse.json({
      success: true,
      message: 'Customer deactivated successfully',
      data: {
        customer: {
          id: updatedCustomer!._id,
          firstName: updatedCustomer!.firstName,
          lastName: updatedCustomer!.lastName,
          phone: updatedCustomer!.phone,
          status: updatedCustomer!.status,
          deletedAt: updatedCustomer!.deletedAt
        }
      }
    });

  } catch (error) {
    console.error('Deactivate customer error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
