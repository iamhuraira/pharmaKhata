import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Category } from '@/lib/models/category';

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
        { urduName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Get total count for pagination
    const totalCategories = await Category.countDocuments(query);

    // Get categories
    const categories = await Category.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(totalCategories / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return res.status(200).json({
      success: true,
      data: {
        categories,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCategories,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      },
      message: 'Categories retrieved successfully'
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
