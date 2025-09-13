import React, { useEffect } from 'react';
import { Modal, Input, InputNumber, Select, DatePicker, Button, Card, Typography, Divider, Alert } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

interface OrderPaymentModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  order: any;
  loading?: boolean;
}

const paymentMethods = [
  { label: 'Cash', value: 'cash' },
  { label: 'JazzCash', value: 'jazzcash' },
  { label: 'Bank Transfer', value: 'bank' },
  { label: 'Card', value: 'card' },
  { label: 'Other', value: 'other' }
];

const createValidationSchema = (maxAmount: number) => Yup.object({
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .max(maxAmount, `Amount cannot exceed PKR ${maxAmount.toLocaleString()}`),
  method: Yup.string().required('Payment method is required'),
  reference: Yup.string().required('Reference is required'),
  date: Yup.date().required('Date is required'),
  note: Yup.string().max(500, 'Note cannot exceed 500 characters')
});

const OrderPaymentModal: React.FC<OrderPaymentModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  order,
  loading = false
}) => {


  if (!order) return null;

  // Calculate order totals
  const orderItems = order.items?.map((item: any) => ({
    ...item,
    total: item.qty * item.price,
    productName: item.product?.name || item.productName || 'Unknown Product'
  })) || [];

  const subtotal = orderItems.reduce((sum: number, item: any) => sum + item.total, 0);
  const discount = order.totals?.discountTotal || 0;
  const grandTotal = order.totals?.grandTotal || subtotal - discount;
  const amountReceived = order.totals?.amountReceived || 0;
  const advanceUsed = order.totals?.advanceUsed || 0;
  const totalPaid = amountReceived + advanceUsed;
  const balanceDue = order.totals?.balance || (grandTotal - totalPaid);

  const formik = useFormik({
    initialValues: {
      amount: balanceDue > 0 ? balanceDue : 0,
      method: 'cash',
      reference: '',
      date: dayjs(),
      note: ''
    },
    validationSchema: createValidationSchema(balanceDue),
    onSubmit: (values) => {
      const paymentData = {
        orderId: order._id || order.orderId,
        customerId: order.customer?.id,
        amount: values.amount,
        method: values.method,
        reference: values.reference,
        date: values.date.toISOString(),
        note: values.note
      };
      onSubmit(paymentData);
    }
  });

  const handleCancel = () => {
    formik.resetForm();
    onCancel();
  };

  // Auto-fill amount when modal opens
  useEffect(() => {
    if (visible && balanceDue > 0) {
      formik.setFieldValue('amount', balanceDue);
    }
  }, [visible, balanceDue]);

  return (
    <Modal
      title={`Record Payment - Order #${order.orderId || order._id}`}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <div className="space-y-4">
        {/* Order Summary */}
        <Card title="Order Summary" size="small">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Text>Customer:</Text>
              <Text strong>{order.customer?.firstName} {order.customer?.lastName}</Text>
            </div>
            <div className="flex justify-between">
              <Text>Grand Total:</Text>
              <Text strong>PKR {grandTotal.toLocaleString()}</Text>
            </div>
            <div className="flex justify-between">
              <Text>Amount Received:</Text>
              <Text>PKR {amountReceived.toLocaleString()}</Text>
            </div>
            {advanceUsed > 0 && (
              <div className="flex justify-between" style={{ color: '#1890ff' }}>
                <Text>Advance Used:</Text>
                <Text>PKR {advanceUsed.toLocaleString()}</Text>
              </div>
            )}
            <Divider className="my-2" />
            <div className="flex justify-between text-lg">
              <Text strong>Balance Due:</Text>
              <Text strong className={balanceDue > 0 ? 'text-red-600' : 'text-green-600'}>
                {balanceDue > 0 ? '+' : ''}PKR {balanceDue.toLocaleString()}
              </Text>
            </div>
            {advanceUsed > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Note: This order used {advanceUsed.toLocaleString()} PKR from customer's advance balance.
              </div>
            )}
          </div>
        </Card>

        {/* Payment Alert */}
        {balanceDue <= 0 && (
          <Alert
            message="Order Already Paid"
            description="This order has been fully paid. No additional payment is needed."
            type="success"
            showIcon
          />
        )}

        {/* Payment Form */}
        {balanceDue > 0 && (
          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (PKR) *
                </label>
                <InputNumber
                  value={formik.values.amount}
                  onChange={(value) => formik.setFieldValue('amount', value)}
                  onBlur={formik.handleBlur}
                  className="w-full"
                  min={0}
                  max={balanceDue}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                  status={formik.touched.amount && formik.errors.amount ? 'error' : ''}
                />
                {formik.touched.amount && formik.errors.amount && (
                  <div className="text-red-500 text-sm mt-1">{String(formik.errors.amount)}</div>
                )}
                <div className="text-sm text-gray-500 mt-1">
                  Maximum payment: PKR {balanceDue.toLocaleString()}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <Select
                  value={formik.values.method}
                  onChange={(value) => formik.setFieldValue('method', value)}
                  className="w-full"
                  status={formik.touched.method && formik.errors.method ? 'error' : ''}
                >
                  {paymentMethods.map(method => (
                    <Option key={method.value} value={method.value}>
                      {method.label}
                    </Option>
                  ))}
                </Select>
                {formik.touched.method && formik.errors.method && (
                  <div className="text-red-500 text-sm mt-1">{String(formik.errors.method)}</div>
                )}
              </div>

              {/* Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference *
                </label>
                <Input
                  name="reference"
                  value={formik.values.reference}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g., Receipt #123, Transaction ID"
                  status={formik.touched.reference && formik.errors.reference ? 'error' : ''}
                />
                {formik.touched.reference && formik.errors.reference && (
                  <div className="text-red-500 text-sm mt-1">{String(formik.errors.reference)}</div>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date *
                </label>
                <DatePicker
                  value={formik.values.date}
                  onChange={(date) => formik.setFieldValue('date', date)}
                  className="w-full"
                  format="YYYY-MM-DD"
                  status={formik.touched.date && formik.errors.date ? 'error' : ''}
                />
                {formik.touched.date && formik.errors.date && (
                  <div className="text-red-500 text-sm mt-1">{String(formik.errors.date)}</div>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <Input.TextArea
                  value={formik.values.note}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Optional payment note"
                  rows={3}
                  maxLength={500}
                  status={formik.touched.note && formik.errors.note ? 'error' : ''}
                />
                {formik.touched.note && formik.errors.note && (
                  <div className="text-red-500 text-sm mt-1">{String(formik.errors.note)}</div>
                )}
              </div>

              {/* Payment Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-blue-800">
                  <div><strong>Payment Preview:</strong></div>
                  <div>Amount: PKR {formik.values.amount.toLocaleString()}</div>
                  <div>Method: {paymentMethods.find(m => m.value === formik.values.method)?.label}</div>
                  {formik.values.amount > balanceDue && (
                    <div className="text-orange-600 mt-1">
                      <strong>Note:</strong> Payment amount exceeds balance due. 
                      Excess will be recorded as advance.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  disabled={!formik.isValid || formik.isSubmitting || balanceDue <= 0}
                  icon={<DollarOutlined />}
                >
                  Record Payment
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default OrderPaymentModal;
