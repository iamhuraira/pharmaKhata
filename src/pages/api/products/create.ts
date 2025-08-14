import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Product } from '@/lib/models/product';
import { Category } from '@/lib/models/category';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectDB();

    const { 
      name, 
      shortDescription, 
      urduDescription, 
      quantity, 
      price, 
      size, 
      packType, 
      categoryId 
    } = req.body;

    // Validation
    if (!name || !packType || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Name, pack type, price, and category are required'
      });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a non-negative number'
      });
    }

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a non-negative number'
      });
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this name already exists'
      });
    }

    // Create new product
    const newProduct = new Product({
      name,
      shortDescription,
      urduDescription,
      quantity: quantity || 0,
      price,
      size,
      packType,
      categoryId
    });

    await newProduct.save();

    // Populate category information
    await newProduct.populate('categoryId', 'name urduName description');

    return res.status(201).json({
      success: true,
      data: {
        product: newProduct
      },
      message: 'Product created successfully'
    });

  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
