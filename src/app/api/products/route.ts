import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Product } from '@/lib/models/product';
import { Category } from '@/lib/models/category';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    Product && Category;
    
    const body = await request.json();
    
    const {
      name,
      shortDescription,
      urduDescription,
      price,
      quantity,
      categoryId,
      size,
      packType
    } = body;

    // Validate required fields
    if (!name || !price || !quantity || !packType) {
      return NextResponse.json({
        success: false,
        message: 'Name, price, quantity, and pack type are required'
      }, { status: 400 });
    }

    // Validate category exists if provided
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return NextResponse.json({
          success: false,
          message: 'Category not found'
        }, { status: 404 });
      }
    }

    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return NextResponse.json({
        success: false,
        message: 'Product with this name already exists'
      }, { status: 409 });
    }

    // Create product
    const product = new Product({
      name,
      shortDescription,
      urduDescription,
      price,
      quantity,
      categoryId,
      size,
      packType
    });

    await product.save();

    return NextResponse.json({
      success: true,
      data: {
        productId: product._id,
        product: {
          id: product._id,
          name: product.name,
          shortDescription: product.shortDescription,
          urduDescription: product.urduDescription,
          price: product.price,
          quantity: product.quantity,
          categoryId: product.categoryId,
          size: product.size,
          packType: product.packType
        }
      },
      message: 'Product created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create product error:', error);
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
    Product && Category;
    
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build filter
    const filter: any = {};
    
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { shortDescription: { $regex: q, $options: 'i' } },
        { urduDescription: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    // Execute query
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      (Product as any).find(filter)
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (Product as any).countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    // Map products to expected format
    const mappedProducts = products.map((product: any) => ({
      id: product._id,
      name: product.name,
      shortDescription: product.shortDescription,
      urduDescription: product.urduDescription,
      price: product.price,
      quantity: product.quantity,
      categoryId: product.categoryId?._id,
      categoryName: product.categoryId?.name,
      size: product.size,
      packType: product.packType,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: mappedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
