// src/pages/api/hello.ts

import { connectDB } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';

// Define the “shape” of the JSON response
type Data = {
    message: string;
};

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    // You could branch by HTTP method:
    // if (req.method === 'POST') { … }
    await connectDB();
    res.status(200).json({message: 'Hello from Next.js API (TypeScript)!'});
}
