'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Alert, List, Statistic, Row, Col, Spin, Typography, Divider, Radio, Select, Space } from 'antd';
import { ExclamationCircleOutlined, WarningOutlined, InfoCircleOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useValidateCustomerDeletion, useDeleteCustomer } from '@/hooks/customer';

const { Title, Text } = Typography;

interface CustomerDeletionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId: string;
  customerName: string;
}

export default function CustomerDeletionModal({
  visible,
  onClose,
  onSuccess,
  customerId,
  customerName
}: CustomerDeletionModalProps) {
  const [validationData, setValidationData] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('soft_delete');
  const [selectedArchiveCustomer, setSelectedArchiveCustomer] = useState<string>('');
  
  const { validateCustomerDeletion } = useValidateCustomerDeletion();
  const { isLoading: isDeleting } = useDeleteCustomer();

  useEffect(() => {
    if (visible && customerId) {
      validateCustomer();
    }
  }, [visible, customerId]);

  const validateCustomer = async () => {
    try {
      setIsValidating(true);
      const result = await validateCustomerDeletion(customerId);
      setValidationData(result.data);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDelete = async (forceDelete = false) => {
    try {
      const url = new URL(`/api/customers/${customerId}`, window.location.origin);
      if (forceDelete) {
        url.searchParams.set('force', 'true');
      }
      url.searchParams.set('strategy', selectedStrategy);
      if (selectedStrategy === 'archive' && selectedArchiveCustomer) {
        url.searchParams.set('archiveCustomerId', selectedArchiveCustomer);
      }

      const response = await fetch(url.toString(), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete customer');
      }

      const result = await response.json();
      console.log('Deletion result:', result);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleClose = () => {
    setValidationData(null);
    onClose();
  };

  const canDelete = validationData?.validation?.canDelete;
  const reasons = validationData?.validation?.reasons || [];
  const summary = validationData?.validation?.summary;
  const details = validationData?.details;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined className="text-red-500" />
          <span>Delete Customer: {customerName}</span>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={800}
      className="customer-deletion-modal"
    >
      <div className="space-y-4">
        {isValidating ? (
          <div className="text-center py-8">
            <Spin size="large" />
            <div className="mt-4">Validating customer data...</div>
          </div>
        ) : validationData ? (
          <>
            {/* Validation Results */}
            {canDelete ? (
              <Alert
                message="Safe to Delete"
                description="This customer can be safely deleted as they have no outstanding relationships."
                type="success"
                icon={<InfoCircleOutlined />}
                showIcon
              />
            ) : (
              <Alert
                message="Cannot Delete Safely"
                description="This customer has existing relationships that prevent safe deletion."
                type="warning"
                icon={<WarningOutlined />}
                showIcon
              />
            )}

            {/* Summary Statistics */}
            {summary && (
              <div className="mt-4">
                <Title level={5}>Customer Summary</Title>
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic title="Total Orders" value={summary.totalOrders} />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="Pending Orders" 
                      value={summary.pendingOrders} 
                      valueStyle={{ color: summary.pendingOrders > 0 ? '#cf1322' : undefined }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic title="Total Transactions" value={summary.totalTransactions} />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="Current Balance" 
                      value={summary.currentBalance} 
                      precision={2}
                      suffix="PKR"
                      valueStyle={{ 
                        color: summary.currentBalance > 0 ? '#52c41a' : summary.currentBalance < 0 ? '#cf1322' : undefined 
                      }}
                    />
                  </Col>
                </Row>
              </div>
            )}

            {/* Reasons for not being able to delete */}
            {reasons.length > 0 && (
              <div className="mt-4">
                <Title level={5}>Issues Preventing Deletion</Title>
                <List
                  size="small"
                  dataSource={reasons}
                  renderItem={(reason: string) => (
                    <List.Item>
                      <Text type="danger">• {reason}</Text>
                    </List.Item>
                  )}
                />
              </div>
            )}

            {/* Recent Activity */}
            {details && (
              <div className="mt-4">
                <Title level={5}>Recent Activity</Title>
                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <Text strong>Recent Orders ({details.recentOrders?.length || 0})</Text>
                      <List
                        size="small"
                        dataSource={details.recentOrders?.slice(0, 3) || []}
                        renderItem={(order: any) => (
                          <List.Item>
                            <div className="flex justify-between w-full">
                              <Text>{order.orderId}</Text>
                              <Text type="secondary">{order.status}</Text>
                            </div>
                          </List.Item>
                        )}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text strong>Recent Transactions ({details.recentTransactions?.length || 0})</Text>
                      <List
                        size="small"
                        dataSource={details.recentTransactions?.slice(0, 3) || []}
                        renderItem={(txn: any) => (
                          <List.Item>
                            <div className="flex justify-between w-full">
                              <Text>{txn.type}</Text>
                              <Text type="secondary">
                                {txn.credit > 0 ? `+${txn.credit}` : `-${txn.debit}`} PKR
                              </Text>
                            </div>
                          </List.Item>
                        )}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            )}

            <Divider />

            {/* Transaction Handling Strategy */}
            {validationData?.transactionStrategies && (
              <div className="mt-4">
                <Title level={5}>
                  <DatabaseOutlined className="mr-2" />
                  Transaction Handling Strategy
                </Title>
                <Radio.Group 
                  value={selectedStrategy} 
                  onChange={(e) => setSelectedStrategy(e.target.value)}
                  className="w-full"
                >
                  <Space direction="vertical" className="w-full">
                    {validationData.transactionStrategies.map((strategy: any) => (
                      <Radio key={strategy.id} value={strategy.id} className="w-full">
                        <div className="ml-2">
                          <div className="flex items-center gap-2">
                            <Text strong>{strategy.name}</Text>
                            {strategy.recommended && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                Recommended
                              </span>
                            )}
                          </div>
                          <Text type="secondary" className="block text-sm">
                            {strategy.description}
                          </Text>
                          {strategy.warning && (
                            <Text type="danger" className="block text-sm">
                              ⚠️ {strategy.warning}
                            </Text>
                          )}
                        </div>
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>

                {/* Archive Customer Selection */}
                {selectedStrategy === 'archive' && validationData.archiveCustomers && (
                  <div className="mt-4">
                    <Text strong>Select Customer to Archive Data To:</Text>
                    <Select
                      className="w-full mt-2"
                      placeholder="Select a customer to transfer data to"
                      value={selectedArchiveCustomer}
                      onChange={setSelectedArchiveCustomer}
                      options={validationData.archiveCustomers.map((customer: any) => ({
                        value: customer.id,
                        label: `${customer.name} (${customer.phone})`
                      }))}
                    />
                  </div>
                )}
              </div>
            )}

            <Divider />

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button onClick={handleClose}>
                Cancel
              </Button>
              {canDelete ? (
                <Button 
                  type="primary" 
                  danger 
                  onClick={() => handleDelete(false)}
                  loading={isDeleting}
                  disabled={selectedStrategy === 'archive' && !selectedArchiveCustomer}
                >
                  Delete Customer
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  danger 
                  onClick={() => handleDelete(true)}
                  loading={isDeleting}
                  disabled={selectedStrategy === 'archive' && !selectedArchiveCustomer}
                >
                  Force Delete
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Text type="secondary">Unable to load validation data</Text>
          </div>
        )}
      </div>
    </Modal>
  );
}
