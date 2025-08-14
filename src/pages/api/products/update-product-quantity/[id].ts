import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Product } from '@/lib/models/product';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectDB();

    const { id } = req.query;
    const { quantity } = req.body;

    // Validation
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a non-negative number'
      });
    }

    // Find and update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { 
        quantity,
        updatedAt: new Date()
      },
      { 
        new: true,
        runValidators: true
      }
    ).populate('categoryId', 'name urduName');

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        product: updatedProduct
      },
      message: 'Product quantity updated successfully'
    });

  } catch (error) {
    console.error('Update product quantity error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
