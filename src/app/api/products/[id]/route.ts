import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Product } from '@/lib/models/product';
import { Category } from '@/lib/models/category';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to database
    await connectDB();

    const { id } = await params;

    // Validation
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'Product ID is required'
      }, { status: 400 });
    }

    // Find the product with category information
    const product = await Product.findById(id)
      .populate('categoryId', 'name urduName description')
      .lean();

    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        product
      },
      message: 'Product retrieved successfully'
    });

  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to database
    await connectDB();

    const { id } = await params;
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

    // Validation
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'Product ID is required'
      }, { status: 400 });
    }

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
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

    // Check if product with same name already exists (excluding current product)
    if (name && name !== existingProduct.name) {
      const duplicateProduct = await Product.findOne({ 
        name, 
        _id: { $ne: id } 
      });
      if (duplicateProduct) {
        return NextResponse.json({
          success: false,
          message: 'Product with this name already exists'
        }, { status: 409 });
      }
    }

    // Validate numeric fields
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return NextResponse.json({
        success: false,
        message: 'Price must be a non-negative number'
      }, { status: 400 });
    }

    if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
      return NextResponse.json({
        success: false,
        message: 'Quantity must be a non-negative number'
      }, { status: 400 });
    }

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (urduDescription !== undefined) updateData.urduDescription = urduDescription;
    if (price !== undefined) updateData.price = price;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (size !== undefined) updateData.size = size;
    if (packType !== undefined) updateData.packType = packType;

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).populate('categoryId', 'name urduName description');

    return NextResponse.json({
      success: true,
      data: {
        product: updatedProduct
      },
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update product error:', error);
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
    // Connect to database
    await connectDB();

    const { id } = await params;

    // Validation
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'Product ID is required'
      }, { status: 400 });
    }

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

