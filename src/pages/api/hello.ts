// src/pages/api/hello.ts

import type { NextApiRequest, NextApiResponse } from 'next';

// Define the “shape” of the JSON response
type Data = {
    message: string;
};

export default function handler(
    _req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    // You could branch by HTTP method:
    // if (req.method === 'POST') { … }

    res.status(200).json({ message: 'Hello from Next.js API (TypeScript)!' });
}
