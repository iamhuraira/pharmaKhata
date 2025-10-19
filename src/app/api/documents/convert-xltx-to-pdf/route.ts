import { NextRequest, NextResponse } from 'next/server';
import { convertXltxToPdf } from '@/lib/utils/documentConversion';

export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'No file provided'
      }, { status: 400 });
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Convert XLTX to PDF using utility function
    const result = await convertXltxToPdf(fileBuffer, file.name);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.error || 'Conversion failed'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'File converted successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Document conversion error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to convert document',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
