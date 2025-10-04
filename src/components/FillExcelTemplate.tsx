'use client';

import React, { useState } from 'react';
import { Button, Card, message, Input, Form, Space } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { pdfGenerator } from '../services/pdfGenerator';

const FillExcelTemplate: React.FC = () => {
  const [isFilling, setIsFilling] = useState(false);
  const [form] = Form.useForm();

  const handleFillTemplate = async () => {
    setIsFilling(true);
    try {
      // Example data
      const sampleData = {
        orderId: 'ORD-001',
        customerName: 'John Doe',
        customerPhone: '+92 300 1234567',
        customerEmail: 'john.doe@example.com',
        subtotal: 1000,
        discount: 50,
        grandTotal: 950,
        paymentMethod: 'Cash'
      };

      // Example cell mappings
      const cellMappings = {
        'J1': sampleData.orderId,           // Order ID in J1
        'J5': sampleData.customerName,      // Customer name in J5
        'J6': sampleData.customerPhone,     // Customer phone in J6
        'J7': sampleData.customerEmail,     // Customer email in J7
        'J10': sampleData.subtotal,         // Subtotal in J10
        'J11': sampleData.discount,         // Discount in J11
        'J12': sampleData.grandTotal,       // Grand total in J12
        'J16': sampleData.paymentMethod,    // Payment method in J16
        'A1': 'Order Invoice',              // Title in A1
        'A3': `Order ID: ${sampleData.orderId}`, // Order info in A3
      };

      console.log('🚀 Starting Excel template filling with sample data...');
      await pdfGenerator.fillExcelTemplate(sampleData, cellMappings);
      message.success('Excel template filled and downloaded successfully!');
    } catch (error) {
      console.error('Error filling Excel template:', error);
      message.error('Failed to fill Excel template');
    } finally {
      setIsFilling(false);
    }
  };

  const handleCustomFill = async (values: any) => {
    setIsFilling(true);
    try {
      // Custom data from form
      const customData = {
        orderId: values.orderId || 'ORD-001',
        customerName: values.customerName || 'Customer Name',
        customerPhone: values.customerPhone || 'Phone Number',
        customerEmail: values.customerEmail || 'Email',
        subtotal: values.subtotal || 0,
        discount: values.discount || 0,
        grandTotal: values.grandTotal || 0,
        paymentMethod: values.paymentMethod || 'Cash'
      };

      // Custom cell mappings
      const cellMappings = {
        'J1': customData.orderId,
        'J5': customData.customerName,
        'J6': customData.customerPhone,
        'J7': customData.customerEmail,
        'J10': customData.subtotal,
        'J11': customData.discount,
        'J12': customData.grandTotal,
        'J16': customData.paymentMethod,
        'A1': 'Order Invoice',
        'A3': `Order ID: ${customData.orderId}`,
      };

      console.log('🚀 Starting Excel template filling with custom data...');
      await pdfGenerator.fillExcelTemplate(customData, cellMappings);
      message.success('Excel template filled and downloaded successfully!');
    } catch (error) {
      console.error('Error filling Excel template:', error);
      message.error('Failed to fill Excel template');
    } finally {
      setIsFilling(false);
    }
  };

  return (
    <Card title="Fill Excel Template" style={{ margin: '20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <h4>Quick Test with Sample Data</h4>
          <Button 
            type="primary" 
            icon={<FileTextOutlined />} 
            onClick={handleFillTemplate}
            loading={isFilling}
          >
            {isFilling ? 'Filling Template...' : 'Fill with Sample Data'}
          </Button>
        </div>

        <div>
          <h4>Custom Data Fill</h4>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCustomFill}
            style={{ maxWidth: 400 }}
          >
            <Form.Item label="Order ID" name="orderId">
              <Input placeholder="ORD-001" />
            </Form.Item>
            <Form.Item label="Customer Name" name="customerName">
              <Input placeholder="John Doe" />
            </Form.Item>
            <Form.Item label="Customer Phone" name="customerPhone">
              <Input placeholder="+92 300 1234567" />
            </Form.Item>
            <Form.Item label="Customer Email" name="customerEmail">
              <Input placeholder="john.doe@example.com" />
            </Form.Item>
            <Form.Item label="Subtotal" name="subtotal">
              <Input type="number" placeholder="1000" />
            </Form.Item>
            <Form.Item label="Discount" name="discount">
              <Input type="number" placeholder="50" />
            </Form.Item>
            <Form.Item label="Grand Total" name="grandTotal">
              <Input type="number" placeholder="950" />
            </Form.Item>
            <Form.Item label="Payment Method" name="paymentMethod">
              <Input placeholder="Cash" />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isFilling}
                icon={<FileTextOutlined />}
              >
                {isFilling ? 'Filling Template...' : 'Fill with Custom Data'}
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
          <h4>How it works:</h4>
          <ol>
            <li><strong>Define Data:</strong> Create an object with your data (orderId, customerName, etc.)</li>
            <li><strong>Define Cell Mappings:</strong> Map each data field to specific Excel cells (J1, J5, etc.)</li>
            <li><strong>Call Function:</strong> Use <code>pdfGenerator.fillExcelTemplate(data, cellMappings)</code></li>
            <li><strong>Download:</strong> The filled Excel file will be automatically downloaded</li>
          </ol>
          
          <h4>Example Usage:</h4>
          <pre style={{ backgroundColor: '#e6f7ff', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
{`const data = {
  orderId: 'ORD-001',
  customerName: 'John Doe',
  subtotal: 1000
};

const cellMappings = {
  'J1': data.orderId,        // Order ID in J1
  'J5': data.customerName,   // Customer name in J5
  'J10': data.subtotal       // Subtotal in J10
};

await pdfGenerator.fillExcelTemplate(data, cellMappings);`}
          </pre>
        </div>
      </Space>
    </Card>
  );
};

export default FillExcelTemplate;
