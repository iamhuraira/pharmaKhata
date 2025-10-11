import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { env } from '@/config/envConfig';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    let dbStatus = 'disconnected';
    let dbError = null;
    
    try {
      await connectDB();
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
      dbError = error instanceof Error ? error.message : 'Unknown database error';
    }

    // Get environment info
    const environment = env.NODE_ENV;
    const timestamp = new Date().toISOString();
    
    // Check if we're in production
    const isProduction = environment === 'production';
    
    // Basic health check response
    const healthData = {
      status: 'healthy',
      timestamp,
      environment,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        error: dbError
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        }
      },
      // Only include sensitive info in development
      ...(isProduction ? {} : {
        config: {
          host: env.HOST,
          port: env.PORT,
          corsOrigin: env.CORS_ORIGIN,
          mongoUrl: env.MONGO_URL ? 'configured' : 'not configured',
          jwtSecret: env.JWT_SECRET_KEY ? 'configured' : 'not configured'
        }
      })
    };

    // Determine HTTP status based on health
    const httpStatus = dbStatus === 'connected' ? 200 : 503;

    return NextResponse.json(healthData, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: env.NODE_ENV
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
