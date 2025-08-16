import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Product, Category } from '@/lib/models';

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

    // Get query parameters
    const { 
      search, 
      category, 
      page = '1', 
      limit = '50',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    let query: any = {};
    
    // Search filter
    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { urduDescription: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && typeof category === 'string') {
      query.categoryId = category;
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);

    // Get products with category information
    const products = await Product.find(query)
      .populate('categoryId', 'name urduName')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(totalProducts / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalProducts,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      },
      message: 'Products retrieved successfully'
    });

  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
