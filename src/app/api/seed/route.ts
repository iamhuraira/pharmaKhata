import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/user';
import { Role } from '@/lib/models/roles';
import { Permission } from '@/lib/models/permissions';
import { Product } from '@/lib/models/product';
import { Category } from '@/lib/models/category';
// import { users } from '@/seeders/data'; // Not needed as we use seedUsers function
import seedRoles from '@/seeders/seedRoles';
import seedPermissions from '@/seeders/seedPermissions';
import seedProducts from '@/seeders/seedProduct';
import seedCategories from '@/seeders/seedCategory';
import seedUsers from '@/seeders/seedUsers';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Seed endpoint is ready. Use POST method with Authorization header to drop and seed database.',
    warning: '⚠️ WARNING: This will DELETE ALL existing data in the database!',
    usage: {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer your-secret-seed-token',
        'Content-Type': 'application/json'
      }
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    // Security check - only allow in development or with special token
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.SEED_TOKEN || 'your-secret-seed-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized. Provide valid seed token.'
      }, { status: 401 });
    }

    console.log('🌱 Starting database seeding...');
    console.log('⚠️  WARNING: This will delete ALL existing data in the database!');
    
    // Connect to database
    await connectDB();
    
    // Drop the database first to start fresh
    console.log('🗑️ Dropping existing database...');
    const mongoose = require('mongoose');
    await mongoose.connection.dropDatabase();
    console.log('✅ Database dropped successfully');
    
    // 1. Seed permissions
    console.log('📋 Seeding permissions...');
    await seedPermissions();
    
    // 2. Seed roles
    console.log('👥 Seeding roles...');
    await seedRoles();
    
    // 3. Seed users
    console.log('👤 Seeding users...');
    await seedUsers();
    
    // 4. Seed categories
    console.log('📂 Seeding categories...');
    await seedCategories();
    
    // 5. Seed products
    console.log('📦 Seeding products...');
    await seedProducts();
    
    // Get counts
    const userCount = await User.countDocuments();
    const roleCount = await Role.countDocuments();
    const permissionCount = await Permission.countDocuments();
    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    
    console.log('🎉 Database seeding completed successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Database dropped and seeded successfully',
      data: {
        users: userCount,
        roles: roleCount,
        permissions: permissionCount,
        products: productCount,
        categories: categoryCount
      }
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
    return NextResponse.json({
      success: false,
      message: 'Seeding failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
