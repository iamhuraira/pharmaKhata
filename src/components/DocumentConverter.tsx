'use client';

import { useState } from 'react';
import { Card, Typography, Button, Upload, message, Spin, Alert } from 'antd';
import { UploadOutlined, FilePdfOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ConversionResult {
  success: boolean;
  message: string;
  data?: {
    originalFileName: string;
    convertedFileName: string;
    pdfBase64: string;
    fileSize: number;
  };
  error?: string;
}

export default function DocumentConverter() {
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsConverting(true);
    setConversionResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/documents/convert-xltx-to-pdf', {
        method: 'POST',
        body: formData,
      });

      const result: ConversionResult = await response.json();
      setConversionResult(result);

      if (result.success) {
        message.success('File converted successfully!');
      } else {
        message.error(result.message || 'Conversion failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload file');
      setConversionResult({
        success: false,
        message: 'Upload failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsConverting(false);
    }
  };

  const downloadPdf = () => {
    if (!conversionResult?.data?.pdfBase64) return;

    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${conversionResult.data.pdfBase64}`;
    link.download = conversionResult.data.convertedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isXltx = file.name.toLowerCase().endsWith('.xltx');
      if (!isXltx) {
        message.error('You can only upload XLTX files!');
        return false;
      }
      const isLt10MB = file.size / 1024 / 1024 < 10;
      if (!isLt10MB) {
        message.error('File must be smaller than 10MB!');
        return false;
      }
      handleFileUpload(file);
      return false; // Prevent default upload
    },
    showUploadList: false,
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <div className="text-center mb-6">
          <Title level={2}>XLTX to PDF Converter</Title>
          <Text type="secondary">
            Convert your Excel template files (.xltx) to PDF format
          </Text>
        </div>

        <div className="text-center mb-6">
          <Upload {...uploadProps}>
            <Button 
              icon={<UploadOutlined />} 
              size="large"
              disabled={isConverting}
            >
              {isConverting ? 'Converting...' : 'Choose XLTX File'}
            </Button>
          </Upload>
        </div>

        {isConverting && (
          <div className="text-center mb-4">
            <Spin size="large" />
            <div className="mt-2">
              <Text>Converting your file...</Text>
            </div>
          </div>
        )}

        {conversionResult && (
          <div className="mt-6">
            {conversionResult.success ? (
              <Alert
                message="Conversion Successful!"
                description={
                  <div>
                    <p><strong>Original File:</strong> {conversionResult.data?.originalFileName}</p>
                    <p><strong>Converted File:</strong> {conversionResult.data?.convertedFileName}</p>
                    <p><strong>File Size:</strong> {(conversionResult.data?.fileSize || 0 / 1024).toFixed(2)} KB</p>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={downloadPdf}
                      className="mt-2"
                    >
                      Download PDF
                    </Button>
                  </div>
                }
                type="success"
                showIcon
                icon={<FilePdfOutlined />}
              />
            ) : (
              <Alert
                message="Conversion Failed"
                description={conversionResult.message || conversionResult.error}
                type="error"
                showIcon
              />
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <Text type="secondary" className="text-sm">
            Supported formats: .xltx files only<br />
            Maximum file size: 10MB
          </Text>
        </div>
      </Card>
    </div>
  );
}
