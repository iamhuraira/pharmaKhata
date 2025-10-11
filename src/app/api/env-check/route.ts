import { NextResponse } from 'next/server';
import { env } from '@/config/envConfig';

export async function GET() {
  try {
    const mongoUrl = env.MONGO_URL;
    const isLocalhost = mongoUrl.includes('localhost') || mongoUrl.includes('127.0.0.1');
    
    return NextResponse.json({
      success: true,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        mongoUrl: mongoUrl.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
        isLocalhost: isLocalhost,
        hasMongoUrl: !!mongoUrl,
        mongoUrlLength: mongoUrl.length
      },
      message: isLocalhost 
        ? '⚠️ WARNING: Using localhost MongoDB URL - this will fail on Vercel!' 
        : '✅ Using MongoDB Atlas URL - should work on Vercel'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        mongoUrl: process.env.MONGO_URL ? 'Set but error reading' : 'Not set'
      }
    }, { status: 500 });
  }
}
