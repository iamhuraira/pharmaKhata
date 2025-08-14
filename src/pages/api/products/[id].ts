import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Product } from '@/lib/models/product';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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
