import React from 'react';
import { Modal, Input, InputNumber, Select, DatePicker, Button } from 'antd';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';

interface CustomerPaymentModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  customerId: string;
  customerName: string;
  dueAmount?: number;
  loading?: boolean;
}

const paymentMethods = [
  { label: 'Cash', value: 'cash' },
  { label: 'JazzCash', value: 'jazzcash' },
  { label: 'Bank Transfer', value: 'bank' },
  { label: 'Card', value: 'card' },
  { label: 'Other', value: 'other' }
];

const validationSchema = Yup.object({
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .max(999999, 'Amount cannot exceed 999,999'),
  method: Yup.string().required('Payment method is required'),
  reference: Yup.string().required('Reference is required'),
  date: Yup.date().required('Date is required'),
  note: Yup.string().max(500, 'Note cannot exceed 500 characters')
});

const CustomerPaymentModal: React.FC<CustomerPaymentModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  customerId,
  customerName,
  dueAmount = 0,
  loading = false
}) => {
  const formik = useFormik({
    initialValues: {
      amount: dueAmount > 0 ? dueAmount : 0,
      method: 'cash',
      reference: '',
      date: dayjs(),
      note: ''
    },
    validationSchema,
    onSubmit: (values) => {
      const paymentData = {
        customerId,
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

  return (
    <Modal
      title={`Record Payment - ${customerName}`}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <form onSubmit={formik.handleSubmit}>
        <div className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (PKR) *
            </label>
            <InputNumber
              value={formik.values.amount}
              onChange={(value) => formik.setFieldValue('amount', value)}
              className="w-full"
              min={0}
              max={999999}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
              status={formik.touched.amount && formik.errors.amount ? 'error' : ''}
            />
            {formik.touched.amount && formik.errors.amount && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.amount}</div>
            )}
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
                <Select.Option key={method.value} value={method.value}>
                  {method.label}
                </Select.Option>
              ))}
            </Select>
            {formik.touched.method && formik.errors.method && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.method}</div>
            )}
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference *
            </label>
            <Input
              value={formik.values.reference}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g., Receipt #123, Transaction ID"
              status={formik.touched.reference && formik.errors.reference ? 'error' : ''}
            />
            {formik.touched.reference && formik.errors.reference && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.reference}</div>
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
              <div className="text-red-500 text-sm mt-1">{formik.errors.note}</div>
            )}
          </div>

          {/* Due Amount Info */}
          {dueAmount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <strong>Due Amount:</strong> {dueAmount.toLocaleString()} PKR
              </div>
              {formik.values.amount > dueAmount && (
                <div className="text-sm text-orange-600 mt-1">
                  <strong>Note:</strong> Payment amount exceeds due amount. 
                  Excess will be recorded as advance.
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              disabled={!formik.isValid || formik.isSubmitting}
            >
              Record Payment
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerPaymentModal;
