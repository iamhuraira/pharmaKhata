'use client';

import React, { useState } from 'react';
import { Button, Card, message } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { pdfGenerator } from '../services/pdfGenerator';

const ReadExcelTemplate: React.FC = () => {
  const [isReading, setIsReading] = useState(false);

  const handleReadTemplate = async () => {
    setIsReading(true);
    try {
      console.log('🚀 Starting Excel template reading test...');
      await pdfGenerator.readExcelTemplate();
      message.success('Excel template read successfully! Check console for details.');
    } catch (error) {
      console.error('Error reading Excel template:', error);
      message.error('Failed to read Excel template');
    } finally {
      setIsReading(false);
    }
  };

  return (
    <Card title="Read Excel Template" style={{ margin: '20px' }}>
      <p>Click the button below to read and log the Excel template file structure:</p>
      <Button 
        type="primary" 
        icon={<FileTextOutlined />} 
        onClick={handleReadTemplate}
        loading={isReading}
      >
        {isReading ? 'Reading Template...' : 'Read Excel Template'}
      </Button>
      
      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
        <p><strong>What this will do:</strong></p>
        <ul>
          <li>Load the Excel template from <code>/public/excelTemplate/templete.xltx</code></li>
          <li>Parse the Excel file structure</li>
          <li>Log the number of rows and columns</li>
          <li>Show the first 10 rows with their column structure</li>
          <li>Check if J column exists (needed for J1, J5, etc.)</li>
          <li>Display all information in the browser console</li>
        </ul>
      </div>
    </Card>
  );
};

export default ReadExcelTemplate;
