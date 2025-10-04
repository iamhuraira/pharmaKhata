'use client';

import React from 'react';
import { Button, Card, message, Space, Typography, Divider } from 'antd';
import { DownloadOutlined, SettingOutlined } from '@ant-design/icons';
import { pdfGenerator } from '../services/pdfGenerator';
import CellMappingDiagram from './CellMappingDiagram';

const { Title, Text, Paragraph } = Typography;

const ExcelCellExample: React.FC = () => {
  const testOrderData = {
    orderId: 'ORD-001',
    createdAt: new Date().toISOString(),
    status: 'paid',
    customer: {
      name: 'John Doe',
      phone: '+92 300 1234567',
      email: 'john.doe@example.com',
      address: '123 Main Street, Karachi, Pakistan',
    },
    items: [
      {
        productName: 'Paracetamol 500mg',
        qty: 10,
        price: 50,
        total: 500,
      },
      {
        productName: 'Aspirin 100mg',
        qty: 5,
        price: 30,
        total: 150,
      },
      {
        productName: 'Vitamin C 1000mg',
        qty: 2,
        price: 200,
        total: 400,
      },
    ],
    totals: {
      subtotal: 1050,
      discount: 50,
      grandTotal: 1000,
      amountReceived: 1000,
      advanceUsed: 0,
      balance: 0,
    },
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Test order for PDF generation with Excel cell filling',
    payment: {
      method: 'Cash',
    },
  };

  const handleBasicExcel = async () => {
    try {
      console.log('🚀 Generating Excel with default cell mappings...');
      await pdfGenerator.generateOrderExcel(testOrderData);
      message.success('Basic Excel generated successfully!');
    } catch (error) {
      console.error('Error generating basic Excel:', error);
      message.error('Failed to generate basic Excel');
    }
  };

  const handleCustomCellExcel = async () => {
    try {
      console.log('🚀 Generating Excel with custom cell mappings...');
      
      // Set custom cell mappings for specific Excel cells
      pdfGenerator.setCustomCellMappings({
        // Customer Information in specific cells
        'J5': 'John Doe',           // Customer name in J5
        'J6': '+92 300 1234567',    // Customer phone in J6
        'J7': 'john.doe@example.com', // Customer email in J7
        'J8': '123 Main Street, Karachi, Pakistan', // Customer address in J8
        
        // Order Information
        'J1': 'ORD-001',            // Order ID in J1
        'J2': new Date().toLocaleDateString(), // Order date in J2
        'J3': 'Paid',               // Order status in J3
        
        // Payment Information
        'J10': 1050,                // Subtotal in J10
        'J11': 50,                  // Discount in J11
        'J12': 1000,                // Grand total in J12
        'J13': 1000,                // Amount received in J13
        'J14': 0,                   // Advance used in J14
        'J15': 0,                   // Balance due in J15
        'J16': 'Cash',              // Payment method in J16
        
        // Additional Information
        'J20': 'Test order for Excel generation with cell filling', // Notes in J20
        'J21': new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // Due date in J21
        
        // You can add more custom cells as needed
        'K1': 'PharmaKhata Invoice', // Company name in K1
        'K2': 'Invoice #001',       // Invoice number in K2
        'K3': 'Thank you for your business!', // Thank you message in K3
      });

      await pdfGenerator.generateOrderExcel(testOrderData);
      message.success('Custom cell Excel generated successfully!');
    } catch (error) {
      console.error('Error generating custom cell Excel:', error);
      message.error('Failed to generate custom cell Excel');
    }
  };

  const handleAddSingleCell = async () => {
    try {
      console.log('🚀 Adding single cell mapping and generating Excel...');
      
      // Add a single cell mapping
      pdfGenerator.addCellMapping('L1', 'Custom Field: This is a test');
      pdfGenerator.addCellMapping('L2', 'Generated at: ' + new Date().toLocaleString());
      
      await pdfGenerator.generateOrderExcel(testOrderData);
      message.success('Single cell Excel generated successfully!');
    } catch (error) {
      console.error('Error generating single cell Excel:', error);
      message.error('Failed to generate single cell Excel');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Excel Cell Filling Example</Title>
      
      <Card style={{ marginBottom: '20px' }}>
        <Title level={4}>How Excel Cell Filling Works</Title>
        <Paragraph>
          This example demonstrates how to fill specific Excel cells with order data. 
          Instead of using placeholder text replacement, you can specify exact cell references 
          like J5, A1, etc., and the system will fill those specific cells with your data.
        </Paragraph>
        
        <Title level={5}>Default Cell Mappings:</Title>
        <ul>
          <li><Text code>A1</Text> - Order Invoice title</li>
          <li><Text code>A3</Text> - Order ID</li>
          <li><Text code>A4</Text> - Order date</li>
          <li><Text code>A8</Text> - Customer name</li>
          <li><Text code>A9</Text> - Customer phone</li>
          <li><Text code>A14-D14</Text> - Items table headers</li>
          <li><Text code>A15+</Text> - Order items (dynamically added)</li>
          <li><Text code>A21-A27</Text> - Payment summary</li>
        </ul>
        
        <Title level={5}>Custom Cell Mappings (J column):</Title>
        <ul>
          <li><Text code>J1</Text> - Order ID</li>
          <li><Text code>J2</Text> - Order date</li>
          <li><Text code>J3</Text> - Order status</li>
          <li><Text code>J5</Text> - Customer name</li>
          <li><Text code>J6</Text> - Customer phone</li>
          <li><Text code>J7</Text> - Customer email</li>
          <li><Text code>J8</Text> - Customer address</li>
          <li><Text code>J10-J16</Text> - Payment details</li>
          <li><Text code>J20</Text> - Notes</li>
          <li><Text code>J21</Text> - Due date</li>
        </ul>
      </Card>

      <Card>
        <Title level={4}>Test Excel Generation</Title>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={handleBasicExcel}
            size="large"
            block
          >
            Generate Basic Excel (Default Cell Mappings)
          </Button>
          
          <Button 
            type="default" 
            icon={<SettingOutlined />} 
            onClick={handleCustomCellExcel}
            size="large"
            block
          >
            Generate Excel with Custom Cell Mappings (J Column)
          </Button>
          
          <Button 
            type="dashed" 
            icon={<DownloadOutlined />} 
            onClick={handleAddSingleCell}
            size="large"
            block
          >
            Add Single Cell Mapping & Generate Excel
          </Button>
        </Space>
        
        <Divider />
        
        <Title level={5}>Console Logging</Title>
        <Paragraph>
          Open your browser console (F12) to see detailed logs of:
        </Paragraph>
        <ul>
          <li>📄 Excel template loading</li>
          <li>📍 Cell filling operations</li>
          <li>📦 Items addition to specific rows</li>
          <li>🔄 Excel file generation process</li>
          <li>💾 File download operations</li>
          <li>✅ Success confirmations</li>
        </ul>
      </Card>

      <CellMappingDiagram />
    </div>
  );
};

export default ExcelCellExample;
