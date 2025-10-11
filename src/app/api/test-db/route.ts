import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test connection
    await connectDB();
    
    // Test a simple query
    const mongoose = require('mongoose');
    const db = mongoose.connection;
    
    if (db.readyState === 1) {
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        connectionState: db.readyState,
        host: db.host,
        port: db.port,
        name: db.name
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        connectionState: db.readyState
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
