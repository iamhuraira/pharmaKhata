// Cloudmersive API configuration
const CLOUDMERSIVE_API_KEY = 'f8ab6ae9-f66b-4ae2-8e04-568129da3f0d';
const CLOUDMERSIVE_BASE_URL = 'https://api.cloudmersive.com';

export interface ConversionResult {
  success: boolean;
  data?: {
    originalFileName: string;
    convertedFileName: string;
    pdfBase64: string;
    fileSize: number;
  };
  error?: string;
}

/**
 * Convert XLTX file to PDF using Cloudmersive API
 * @param fileBuffer - Buffer containing the XLTX file data
 * @param originalFileName - Original name of the file
 * @returns Promise<ConversionResult>
 */
export async function convertXltxToPdf(
  fileBuffer: Buffer, 
  originalFileName: string
): Promise<ConversionResult> {
  try {
    // Validate file type
    if (!originalFileName.toLowerCase().endsWith('.xltx')) {
      return {
        success: false,
        error: 'File must be an XLTX file'
      };
    }

    // Convert XLTX to PDF using Cloudmersive API via HTTP request
    const response = await fetch(`${CLOUDMERSIVE_BASE_URL}/convert/xlsx/to/pdf`, {
      method: 'POST',
      headers: {
        'Apikey': CLOUDMERSIVE_API_KEY,
        'Content-Type': 'application/octet-stream'
      },
      body: fileBuffer as any
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudmersive API Error: ${response.status} - ${errorText}`);
    }

    const pdfBuffer = Buffer.from(await response.arrayBuffer());
    const pdfBase64 = pdfBuffer.toString('base64');
    const convertedFileName = originalFileName.replace('.xltx', '.pdf');

    return {
      success: true,
      data: {
        originalFileName,
        convertedFileName,
        pdfBase64,
        fileSize: pdfBuffer.length
      }
    };

  } catch (error) {
    console.error('Document conversion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error'
    };
  }
}

/**
 * Convert Excel files to PDF using Cloudmersive API
 * @param fileBuffer - Buffer containing the Excel file data
 * @param originalFileName - Original name of the file
 * @returns Promise<ConversionResult>
 */
export async function convertExcelToPdf(
  fileBuffer: Buffer, 
  originalFileName: string
): Promise<ConversionResult> {
  try {
    // Validate file type
    const validExtensions = ['.xlsx', '.xls', '.xltx', '.xlt'];
    const hasValidExtension = validExtensions.some(ext => 
      originalFileName.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      return {
        success: false,
        error: 'File must be an Excel file (.xlsx, .xls, .xltx, .xlt)'
      };
    }

    // Determine the correct API endpoint based on file type
    let apiEndpoint = '';
    if (originalFileName.toLowerCase().endsWith('.xls')) {
      apiEndpoint = '/convert/xls/to/pdf'; // For Excel 97-2003 files
    } else {
      apiEndpoint = '/convert/xlsx/to/pdf'; // For Excel 2007+ files
    }

    // Convert Excel to PDF using Cloudmersive API via HTTP request
    const response = await fetch(`${CLOUDMERSIVE_BASE_URL}${apiEndpoint}`, {
      method: 'POST',
      headers: {
        'Apikey': CLOUDMERSIVE_API_KEY,
        'Content-Type': 'application/octet-stream'
      },
      body: fileBuffer as any
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudmersive API Error: ${response.status} - ${errorText}`);
    }

    const pdfBuffer = Buffer.from(await response.arrayBuffer());
    const pdfBase64 = pdfBuffer.toString('base64');
    const convertedFileName = originalFileName.replace(/\.[^/.]+$/, '.pdf');

    return {
      success: true,
      data: {
        originalFileName,
        convertedFileName,
        pdfBase64,
        fileSize: pdfBuffer.length
      }
    };

  } catch (error) {
    console.error('Document conversion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error'
    };
  }
}
