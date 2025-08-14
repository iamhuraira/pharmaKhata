import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Product } from '@/lib/models/product';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { id } = req.query;

  // Validation
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }

  try {
    // Connect to database
    await connectDB();

    switch (method) {
      case 'GET':
        return await getProduct(req, res, id);
      case 'PUT':
        return await updateProduct(req, res, id);
      case 'DELETE':
        return await deleteProduct(req, res, id);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Product management error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

// Get single product
async function getProduct(req: NextApiRequest, res: NextApiResponse, id: string) {
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
    data: { product },
    message: 'Product retrieved successfully'
  });
}

// Update product
async function updateProduct(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { name, shortDescription, urduDescription, quantity, price, size, packType, categoryId } = req.body;

  // Validation
  const updateData: any = {};
  
  if (name !== undefined) updateData.name = name;
  if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
  if (urduDescription !== undefined) updateData.urduDescription = urduDescription;
  if (quantity !== undefined) {
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a non-negative number'
      });
    }
    updateData.quantity = quantity;
  }
  if (price !== undefined) {
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a non-negative number'
      });
    }
    updateData.price = price;
  }
  if (size !== undefined) updateData.size = size;
  if (packType !== undefined) updateData.packType = packType;
  if (categoryId !== undefined) updateData.categoryId = categoryId;

  updateData.updatedAt = new Date();

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    updateData,
    { 
      new: true,
      runValidators: true
    }
  ).populate('categoryId', 'name urduName description');

  if (!updatedProduct) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  return res.status(200).json({
    success: true,
    data: { product: updatedProduct },
    message: 'Product updated successfully'
  });
}

// Delete product
async function deleteProduct(req: NextApiRequest, res: NextApiResponse, id: string) {
  const deletedProduct = await Product.findByIdAndDelete(id);

  if (!deletedProduct) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
}
