'use client';

import React from 'react';
import { Card, Typography, Table, Tag } from 'antd';

const { Title, Text } = Typography;

const CellMappingDiagram: React.FC = () => {
  const cellMappings = [
    { cell: 'J1', description: 'Order ID', example: 'ORD-0001' },
    { cell: 'J2', description: 'Order Date', example: '10/04/2025, 10:16 AM' },
    { cell: 'J3', description: 'Order Status', example: 'Created' },
    { cell: 'J5', description: 'Customer Name', example: 'Customer User' },
    { cell: 'J6', description: 'Customer Phone', example: '03086173326' },
    { cell: 'J7', description: 'Customer Email', example: 'customer@example.com' },
    { cell: 'J8', description: 'Customer Address', example: '1 Customer Street, Islamabad' },
    { cell: 'J10', description: 'Subtotal', example: '6730' },
    { cell: 'J11', description: 'Discount', example: '0' },
    { cell: 'J12', description: 'Grand Total', example: '6730' },
    { cell: 'J13', description: 'Amount Received', example: '0' },
    { cell: 'J14', description: 'Advance Used', example: '0' },
    { cell: 'J15', description: 'Balance Due', example: '6730' },
    { cell: 'J16', description: 'Payment Method', example: 'on_account' },
    { cell: 'J20', description: 'Notes', example: 'Any additional notes' },
    { cell: 'J21', description: 'Due Date', example: '10/11/2025' },
  ];

  const columns = [
    {
      title: 'Excel Cell',
      dataIndex: 'cell',
      key: 'cell',
      render: (cell: string) => <Tag color="blue">{cell}</Tag>,
    },
    {
      title: 'Data Field',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Example Value',
      dataIndex: 'example',
      key: 'example',
      render: (example: string) => <Text code>{example}</Text>,
    },
  ];

  return (
    <Card title="Excel Cell Mapping Reference" style={{ margin: '20px' }}>
      <Title level={4}>Where Your Data Will Be Placed</Title>
      <p>
        When you generate an Excel file, the order data will be automatically filled into these specific cells:
      </p>
      
      <Table
        dataSource={cellMappings}
        columns={columns}
        pagination={false}
        size="small"
        style={{ marginTop: '16px' }}
      />
      
      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
        <Title level={5}>How It Works:</Title>
        <ol>
          <li><strong>Load Template:</strong> Your Excel template is loaded from <code>/public/excelTemplate/templete.xltx</code></li>
          <li><strong>Fill Cells:</strong> Order data is placed in specific cells (J1, J5, J10, etc.)</li>
          <li><strong>Add Items:</strong> Order items are added to rows starting from A15</li>
          <li><strong>Download:</strong> The filled Excel file is downloaded as <code>{'Order_{OrderID}_{CustomerName}.xlsx'}</code></li>
        </ol>
      </div>
      
      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#e6f7ff', borderRadius: '6px' }}>
        <Title level={5}>Custom Cell Mappings:</Title>
        <p>You can also set custom cell mappings:</p>
        <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
{`pdfGenerator.setCustomCellMappings({
  'K1': 'Your Company Name',
  'K2': 'Invoice #123',
  'L5': 'Custom Field Value'
});`}
        </pre>
      </div>
    </Card>
  );
};

export default CellMappingDiagram;
