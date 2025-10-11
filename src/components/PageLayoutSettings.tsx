'use client';

import React, { useState } from 'react';
import { Button, Card, message, Form, Select, InputNumber, Space, Divider } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { pdfGenerator } from '../services/pdfGenerator';

const { Option } = Select;

const PageLayoutSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [currentSettings, setCurrentSettings] = useState(pdfGenerator.getPageLayoutSettings());

  const handleUpdateSettings = (values: any) => {
    pdfGenerator.setPageLayoutSettings(values);
    setCurrentSettings(pdfGenerator.getPageLayoutSettings());
    message.success('Page layout settings updated successfully!');
  };

  const handleResetToDefault = () => {
    const defaultSettings = {
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      orientation: 'portrait',
      paperSize: 9,
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.5,
        bottom: 0.5,
        header: 0.3,
        footer: 0.3
      }
    };
    pdfGenerator.setPageLayoutSettings(defaultSettings);
    setCurrentSettings(defaultSettings);
    form.setFieldsValue(defaultSettings);
    message.success('Page layout settings reset to default!');
  };

  const handleTestSinglePage = async () => {
    try {
      // Test data
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

      const cellMappings = {
        'J1': sampleData.orderId,
        'J5': sampleData.customerName,
        'J6': sampleData.customerPhone,
        'J7': sampleData.customerEmail,
        'J10': sampleData.subtotal,
        'J11': sampleData.discount,
        'J12': sampleData.grandTotal,
        'J16': sampleData.paymentMethod,
        'A1': 'Order Invoice',
        'A3': `Order ID: ${sampleData.orderId}`,
      };

      await pdfGenerator.fillExcelTemplate(sampleData, cellMappings);
      message.success('Excel file generated with current page layout settings!');
    } catch (error) {
      console.error('Error generating Excel:', error);
      message.error('Failed to generate Excel file');
    }
  };

  return (
    <Card title="Page Layout Settings" style={{ margin: '20px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <h4>Configure Excel Page Layout for Single Page Output</h4>
          <p>Adjust these settings to ensure your Excel files fit on one page when printed or viewed.</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={currentSettings}
          onFinish={handleUpdateSettings}
        >
          <Form.Item label="Orientation" name="orientation">
            <Select>
              <Option value="portrait">Portrait</Option>
              <Option value="landscape">Landscape</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Paper Size" name="paperSize">
            <Select>
              <Option value={9}>A4 (210 × 297 mm)</Option>
              <Option value={1}>Letter (8.5 × 11 in)</Option>
              <Option value={11}>Legal (8.5 × 14 in)</Option>
              <Option value={8}>A3 (297 × 420 mm)</Option>
            </Select>
          </Form.Item>

          <Divider>Fit to Page Settings</Divider>
          
          <Form.Item label="Fit to Page" name="fitToPage" valuePropName="checked">
            <Select>
              <Option value={true}>Yes</Option>
              <Option value={false}>No</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Fit to Width (pages)" name="fitToWidth">
            <InputNumber min={1} max={10} />
          </Form.Item>

          <Form.Item label="Fit to Height (pages)" name="fitToHeight">
            <InputNumber min={1} max={10} />
          </Form.Item>

          <Divider>Margins (inches)</Divider>
          
          <Form.Item label="Left Margin" name={['margins', 'left']}>
            <InputNumber min={0} max={2} step={0.1} />
          </Form.Item>

          <Form.Item label="Right Margin" name={['margins', 'right']}>
            <InputNumber min={0} max={2} step={0.1} />
          </Form.Item>

          <Form.Item label="Top Margin" name={['margins', 'top']}>
            <InputNumber min={0} max={2} step={0.1} />
          </Form.Item>

          <Form.Item label="Bottom Margin" name={['margins', 'bottom']}>
            <InputNumber min={0} max={2} step={0.1} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SettingOutlined />}>
                Update Settings
              </Button>
              <Button onClick={handleResetToDefault}>
                Reset to Default
              </Button>
              <Button type="dashed" onClick={handleTestSinglePage}>
                Test Single Page Layout
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
          <h4>Current Settings:</h4>
          <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
            {JSON.stringify(currentSettings, null, 2)}
          </pre>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#e6f7ff', borderRadius: '6px' }}>
          <h4>Tips for Single Page Layout:</h4>
          <ul>
            <li><strong>Fit to Page:</strong> Set to "Yes" to automatically scale content to fit</li>
            <li><strong>Fit to Width/Height:</strong> Set both to 1 for single page output</li>
            <li><strong>Orientation:</strong> Use "Landscape" for wider content, "Portrait" for taller content</li>
            <li><strong>Margins:</strong> Smaller margins = more space for content</li>
            <li><strong>Paper Size:</strong> A4 is standard, but you can use larger sizes if needed</li>
          </ul>
        </div>
      </Space>
    </Card>
  );
};

export default PageLayoutSettings;
