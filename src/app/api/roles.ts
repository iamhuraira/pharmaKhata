import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Role } from '@/lib/models/roles';

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

    // Get all roles
    const roles = await Role.find({}, 'name _id');

    return res.status(200).json({
      success: true,
      message: 'Roles retrieved successfully',
      data: roles
    });

  } catch (error) {
    console.error('Roles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
