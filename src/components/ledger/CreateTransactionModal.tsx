'use client';
import { useState } from 'react';
import { Modal, Form, Input, Button, Select, DatePicker, InputNumber, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useCreateLedgerTransaction } from '@/hooks/ledger';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

interface CreateTransactionModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateTransactionModal = ({ open, onCancel, onSuccess }: CreateTransactionModalProps) => {
  const [form] = Form.useForm();
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');

  const { createLedgerTransaction, isLoading } = useCreateLedgerTransaction();

  const handleSubmit = async (values: any) => {
    try {
      const transactionData = {
        date: values.date.toISOString(),
        type: values.type,
        method: values.method,
        description: values.description,
        credit: transactionType === 'credit' ? values.amount : 0,
        debit: transactionType === 'debit' ? values.amount : 0,
        ref: {
          party: values.party,
          orderId: values.orderId,
          txnNo: values.txnNo,
          voucher: values.voucher,
          note: values.note
        }
      };

      await createLedgerTransaction(transactionData);
      message.success('Transaction created successfully');
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('Create transaction error:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const transactionTypes = [
    { value: 'sale', label: 'Sale' },
    { value: 'purchase', label: 'Purchase' },
    { value: 'expense', label: 'Expense' },
    { value: 'payment', label: 'Payment' },
    { value: 'company_remit', label: 'Company Remit' },
    { value: 'commission', label: 'Commission' },
    { value: 'advance', label: 'Advance' },
    { value: 'refund', label: 'Refund' },
    { value: 'adjustment', label: 'Adjustment' },
    { value: 'other', label: 'Other' }
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'jazzcash', label: 'JazzCash' },
    { value: 'bank', label: 'Bank' },
    { value: 'card', label: 'Card' },
    { value: 'advance', label: 'Advance' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Modal
      title="Create New Transaction"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          date: dayjs(),
          type: 'sale',
          method: 'cash',
          transactionType: 'credit'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <Form.Item
            name="date"
            label="Date & Time"
            rules={[{ required: true, message: 'Please select date and time' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              className="w-full"
              placeholder="Select date and time"
            />
          </Form.Item>

          {/* Transaction Type */}
          <Form.Item
            name="type"
            label="Transaction Type"
            rules={[{ required: true, message: 'Please select transaction type' }]}
          >
            <Select placeholder="Select transaction type">
              {transactionTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Payment Method */}
          <Form.Item
            name="method"
            label="Payment Method"
            rules={[{ required: true, message: 'Please select payment method' }]}
          >
            <Select placeholder="Select payment method">
              {paymentMethods.map(method => (
                <Option key={method.value} value={method.value}>
                  {method.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Amount Type */}
          <Form.Item
            label="Amount Type"
            required
          >
            <div className="flex gap-2">
              <Button
                type={transactionType === 'credit' ? 'primary' : 'default'}
                onClick={() => setTransactionType('credit')}
                className="flex-1"
              >
                Credit (+)
              </Button>
              <Button
                type={transactionType === 'debit' ? 'primary' : 'default'}
                onClick={() => setTransactionType('debit')}
                className="flex-1"
              >
                Debit (-)
              </Button>
            </div>
          </Form.Item>
        </div>

        {/* Amount */}
        <Form.Item
          name="amount"
          label="Amount"
          rules={[
            { required: true, message: 'Please enter amount' },
            { type: 'number', min: 0.01, message: 'Amount must be greater than 0' }
          ]}
        >
          <InputNumber
            className="w-full"
            placeholder="Enter amount"
            precision={2}
            min={0.01}
            step={0.01}
            addonAfter="PKR"
          />
        </Form.Item>

        {/* Description */}
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <TextArea
            rows={3}
            placeholder="Enter transaction description"
            maxLength={500}
            showCount
          />
        </Form.Item>

        {/* Reference Information */}
        <Title level={5} className="mt-4 mb-3">Reference Information (Optional)</Title>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="party"
            label="Party/Customer"
          >
            <Input placeholder="Enter party or customer name" />
          </Form.Item>

          <Form.Item
            name="orderId"
            label="Order ID"
          >
            <Input placeholder="Enter order ID" />
          </Form.Item>

          <Form.Item
            name="txnNo"
            label="Transaction Number"
          >
            <Input placeholder="Enter transaction number" />
          </Form.Item>

          <Form.Item
            name="voucher"
            label="Voucher Number"
          >
            <Input placeholder="Enter voucher number" />
          </Form.Item>
        </div>

        {/* Note */}
        <Form.Item
          name="note"
          label="Additional Notes"
        >
          <TextArea
            rows={2}
            placeholder="Enter any additional notes"
            maxLength={200}
            showCount
          />
        </Form.Item>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            icon={<PlusOutlined />}
            className="bg-primary hover:bg-primaryDark"
          >
            Create Transaction
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateTransactionModal;
