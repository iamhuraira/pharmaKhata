import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Product } from '@/lib/models/product';
import { Category } from '@/lib/models/category';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'PUT') {
    return handlePut(req, res);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Connect to database
    await connectDB();

    const { id } = req.query;

    // Validation
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Find the product with category information
    const product = await Product.findById(id)
      .populate('categoryId', 'name urduName description')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        product
      },
      message: 'Product retrieved successfully'
    });

  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Connect to database
    await connectDB();

    const { id } = req.query;
    const {
      name,
      shortDescription,
      urduDescription,
      price,
      quantity,
      categoryId,
      size,
      packType
    } = req.body;

    // Validation
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate category exists if provided
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Check if product with same name already exists (excluding current product)
    if (name && name !== existingProduct.name) {
      const duplicateProduct = await Product.findOne({ 
        name, 
        _id: { $ne: id } 
      });
      if (duplicateProduct) {
        return res.status(409).json({
          success: false,
          message: 'Product with this name already exists'
        });
      }
    }

    // Validate numeric fields
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a non-negative number'
      });
    }

    if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a non-negative number'
      });
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

    return res.status(200).json({
      success: true,
      data: {
        product: updatedProduct
      },
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Connect to database
    await connectDB();

    const { id } = req.query;

    // Validation
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
