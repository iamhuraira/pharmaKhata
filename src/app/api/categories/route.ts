import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category } from '@/lib/models/category';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure model is registered
    Category;
    
    const body = await request.json();
    
    const {
      name,
      urduName,
      description
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({
        success: false,
        message: 'Name is required'
      }, { status: 400 });
    }



    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return NextResponse.json({
        success: false,
        message: 'Category with this name already exists'
      }, { status: 409 });
    }

    // Create category
    const category = new Category({
      name,
      urduName,
      description
    });

    await category.save();

    return NextResponse.json({
      success: true,
      data: {
        categoryId: category._id,
        category: {
          id: category._id,
          name: category.name,
          urduName: category.urduName,
          description: category.description
        }
      },
      message: 'Category created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure model is registered
    Category;
    
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build filter
    const filter: any = {};
    
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { urduName: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // Execute query
    const skip = (page - 1) * limit;
    
    const [categories, total] = await Promise.all([
      (Category as any).find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (Category as any).countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    // Map categories to expected format
    const mappedCategories = categories.map((category: any) => ({
      id: category._id,
      name: category.name,
      urduName: category.urduName,
      description: category.description,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        categories: mappedCategories,
        pagination: {
          currentPage: page,
          totalPages,
          totalCategories: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
