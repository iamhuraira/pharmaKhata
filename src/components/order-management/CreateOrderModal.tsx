import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Select, Button, Table, Card, Typography, Divider, message } from 'antd';
import { PlusOutlined, DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useGetAllCustomers } from '@/hooks/customer';
import { useGetProducts } from '@/hooks/product';
import { useCreateOrder } from '@/hooks/order';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

interface CreateOrderModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface OrderItem {
  productId: string;
  productName: string;
  qty: number;
  price: number;
  total: number;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  balance: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  packType: string;
  shortDescription: string;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [itemQty, setItemQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('on_account');
  const [amountReceived, setAmountReceived] = useState(0);

  const { customers, isLoading: customersLoading } = useGetAllCustomers();
  const { data: products, isLoading: productsLoading } = useGetProducts();
  const { createOrder, isLoading: createLoading } = useCreateOrder();

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const discount = 0; // Can be added later
  const grandTotal = subtotal - discount;
  const balanceDue = grandTotal - amountReceived;

  // Handle customer selection
  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c: any) => c.id === customerId);
    setSelectedCustomer(customer || null);
    form.setFieldsValue({ customerId });
  };

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    const product = products.find((p: any) => p.id === productId);
    setSelectedProduct(product || null);
    if (product) {
      setItemQty(1);
    }
  };

  // Add item to order
  const addOrderItem = () => {
    if (!selectedProduct || itemQty <= 0) {
      message.error('Please select a product and valid quantity');
      return;
    }

    const newItem: OrderItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      qty: itemQty,
      price: selectedProduct.price,
      total: selectedProduct.price * itemQty
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedProduct(null);
    setItemQty(1);
    form.setFieldsValue({ productId: undefined, qty: 1 });
  };

  // Remove item from order
  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (!selectedCustomer) {
        message.error('Please select a customer');
        return;
      }

      if (orderItems.length === 0) {
        message.error('Please add at least one item to the order');
        return;
      }

      const orderData = {
        customer: {
          id: selectedCustomer.id,
          name: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
          phone: selectedCustomer.phone
        },
        items: orderItems.map(item => ({
          productId: item.productId,
          qty: item.qty,
          price: item.price
        })),
        payment: {
          method: paymentMethod,
          amountReceived: amountReceived,
          discount: discount
        },
        dueDate: dayjs().add(30, 'days').toISOString() // Default 30 days
      };

      await createOrder(orderData);
      message.success('Order created successfully!');
      
      // Reset form
      form.resetFields();
      setOrderItems([]);
      setSelectedCustomer(null);
      setAmountReceived(0);
      setPaymentMethod('on_account');
      
      onSuccess();
    } catch (error) {
      console.error('Create order error:', error);
      message.error('Failed to create order');
    }
  };

  // Auto-fill amount received when payment method changes
  useEffect(() => {
    if (paymentMethod === 'cash' || paymentMethod === 'jazzcash' || paymentMethod === 'bank') {
      setAmountReceived(grandTotal);
    } else {
      setAmountReceived(0);
    }
  }, [paymentMethod, grandTotal]);

  const columns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
      width: 80,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => `PKR ${price.toLocaleString()}`,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (total: number) => `PKR ${total.toLocaleString()}`,
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_: any, _record: any, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeOrderItem(index)}
        />
      ),
    },
  ];

  return (
    <Modal
      title="Create New Order"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {/* Customer Selection */}
        <Card title="Customer Information" className="mb-4">
          <Form.Item
            name="customerId"
            label="Select Customer"
            rules={[{ required: true, message: 'Please select a customer' }]}
          >
            <Select
              placeholder="Search and select customer"
              loading={customersLoading}
              showSearch
              filterOption={(input, option) =>
                String(option?.children || '').toLowerCase().includes(input.toLowerCase())
              }
              onChange={handleCustomerSelect}
            >
              {customers.map((customer: any) => (
                <Option key={customer.id} value={customer.id}>
                  {customer.firstName} {customer.lastName} - {customer.phone}
                  {customer.balance !== 0 && ` (Balance: ${customer.balance > 0 ? '+' : ''}${customer.balance.toLocaleString()} PKR)`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedCustomer && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <Text strong>Selected Customer:</Text>
              <div className="mt-2">
                <div><Text>Name: {selectedCustomer.firstName} {selectedCustomer.lastName}</Text></div>
                <div><Text>Phone: {selectedCustomer.phone}</Text></div>
                <div>
                  <Text>Balance: 
                    <span className={selectedCustomer.balance >= 0 ? 'text-red-600' : 'text-green-600'}>
                      {selectedCustomer.balance >= 0 ? '+' : ''}{selectedCustomer.balance.toLocaleString()} PKR
                    </span>
                  </Text>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Product Selection */}
        <Card title="Add Products" className="mb-4">
          <div className="flex space-x-4 mb-4">
            <Form.Item
              name="productId"
              label="Product"
              className="flex-1"
            >
              <Select
                placeholder="Select product"
                loading={productsLoading}
                showSearch
                filterOption={(input, option) =>
                  String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                }
                onChange={handleProductSelect}
              >
                              {products.map((product: any) => (
                <Option key={product.id} value={product.id}>
                  {product.name} - {product.packType} (PKR {product.price.toLocaleString()})
                </Option>
              ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="qty"
              label="Quantity"
              className="w-32"
            >
              <InputNumber
                min={1}
                value={itemQty}
                onChange={(value) => setItemQty(value || 1)}
                className="w-full"
              />
            </Form.Item>

            <Form.Item label=" " className="mb-0">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addOrderItem}
                disabled={!selectedProduct || itemQty <= 0}
              >
                Add Item
              </Button>
            </Form.Item>
          </div>

          {selectedProduct && (
            <div className="bg-green-50 p-3 rounded-lg mb-4">
              <Text strong>Selected Product:</Text>
              <div className="mt-2">
                <div><Text>Name: {selectedProduct.name}</Text></div>
                <div><Text>Pack: {selectedProduct.packType}</Text></div>
                <div><Text>Price: PKR {selectedProduct.price.toLocaleString()}</Text></div>
                <div><Text>Total: PKR {(selectedProduct.price * itemQty).toLocaleString()}</Text></div>
              </div>
            </div>
          )}
        </Card>

        {/* Order Items Table */}
        {orderItems.length > 0 && (
          <Card title="Order Items" className="mb-4">
            <Table
              columns={columns}
              dataSource={orderItems}
              rowKey={(_record, index) => index?.toString() || '0'}
              pagination={false}
              size="small"
            />
          </Card>
        )}

        {/* Payment Information */}
        <Card title="Payment Information" className="mb-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="paymentMethod"
              label="Payment Method"
              initialValue="on_account"
            >
              <Select onChange={setPaymentMethod}>
                <Option value="on_account">On Account</Option>
                <Option value="cash">Cash</Option>
                <Option value="jazzcash">JazzCash</Option>
                <Option value="bank">Bank Transfer</Option>
                <Option value="card">Card</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="amountReceived"
              label="Amount Received (PKR)"
            >
              <InputNumber
                min={0}
                max={grandTotal}
                value={amountReceived}
                onChange={(value) => setAmountReceived(value || 0)}
                className="w-full"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
              />
            </Form.Item>
          </div>
        </Card>

        {/* Order Summary */}
        <Card title="Order Summary" className="mb-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Text>Subtotal:</Text>
              <Text>PKR {subtotal.toLocaleString()}</Text>
            </div>
            <div className="flex justify-between">
              <Text>Discount:</Text>
              <Text>PKR {discount.toLocaleString()}</Text>
            </div>
            <Divider />
            <div className="flex justify-between text-lg font-bold">
              <Text strong>Grand Total:</Text>
              <Text strong>PKR {grandTotal.toLocaleString()}</Text>
            </div>
            <div className="flex justify-between">
              <Text>Amount Received:</Text>
              <Text>PKR {amountReceived.toLocaleString()}</Text>
            </div>
            <Divider />
            <div className="flex justify-between text-lg">
              <Text strong>Balance Due:</Text>
              <Text strong className={balanceDue > 0 ? 'text-red-600' : 'text-green-600'}>
                {balanceDue > 0 ? '+' : ''}PKR {balanceDue.toLocaleString()}
              </Text>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button onClick={onCancel} disabled={createLoading}>
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={handleSubmit}
            loading={createLoading}
            disabled={!selectedCustomer || orderItems.length === 0}
          >
            Create Order
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateOrderModal;
