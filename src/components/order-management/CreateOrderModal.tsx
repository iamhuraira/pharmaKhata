import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, InputNumber, Select, Button, Table, Card, Typography, Divider, message } from 'antd';
import { PlusOutlined, DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useGetAllCustomers } from '@/hooks/customer';
import { useGetProducts } from '@/hooks/product';
import { useCreateOrder } from '@/hooks/order';
import { useGetAllCustomerBalances } from '@/hooks/customerBalance';
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
  _id?: string;
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
  const previousPaymentMethod = useRef('on_account');

  const { customers, isLoading: customersLoading } = useGetAllCustomers();
  const { data: products, isLoading: productsLoading } = useGetProducts();
  const { createOrder, isLoading: createLoading } = useCreateOrder();
  const { customerBalances, isLoading: balancesLoading } = useGetAllCustomerBalances();

  // Debug logging
  console.log('🔍 CreateOrderModal - customers:', customers);
  console.log('🔍 CreateOrderModal - customerBalances:', customerBalances);
  console.log('🔍 CreateOrderModal - selectedCustomer:', selectedCustomer);

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const discount = 0; // Can be added later
  const grandTotal = subtotal - discount;
  const balanceDue = grandTotal - amountReceived;

  // Handle customer selection
  const handleCustomerSelect = (customerId: string) => {
    console.log('🔍 handleCustomerSelect called with customerId:', customerId);
    console.log('🔍 Available customers:', customers);
    console.log('🔍 Available customerBalances:', customerBalances);
    
    const customer = customers.find((c: any) => c.id === customerId);
    console.log('🔍 Found customer:', customer);
    
    if (customer) {
      // Get real balance from the balance calculation system
      const customerBalance = customerBalances?.find((cb: any) => {
        console.log('🔍 Checking balance for:', cb.customerId, 'against:', customerId, 'or', customer._id);
        // Try multiple ways to match customer ID
        return cb.customerId === customerId || 
               cb.customerId === customer._id || 
               cb.customerId === customer.id ||
               String(cb.customerId) === String(customerId) ||
               String(cb.customerId) === String(customer._id) ||
               String(cb.customerId) === String(customer.id);
      });
      
      console.log('🔍 Found customerBalance:', customerBalance);
      
      const customerWithBalance = {
        ...customer,
        balance: customerBalance?.balance || 0
      };
      
      console.log('🔍 Final customerWithBalance:', customerWithBalance);
      
      setSelectedCustomer(customerWithBalance);
      form.setFieldsValue({ customerId });
    } else {
      setSelectedCustomer(null);
    }
  };

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    const product = (products || []).find((p: any) => p.id === productId);
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

      // Validate payment based on payment method
      if (paymentMethod !== 'on_account') {
        if (amountReceived <= 0) {
          message.error('Please enter the amount received');
          return;
        }

        // Check if payment covers the order (including advance)
        const totalPaymentAvailable = amountReceived + Math.max(0, selectedCustomer.balance || 0);
        if (totalPaymentAvailable < grandTotal) {
          message.error(`Insufficient payment. Order total: ${grandTotal.toLocaleString()} PKR, Available: ${totalPaymentAvailable.toLocaleString()} PKR`);
          return;
        }
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
      setPaymentMethod('cash');
      
      onSuccess();
    } catch (error) {
      console.error('Create order error:', error);
      message.error('Failed to create order');
    }
  };

  // Auto-fill amount received when payment method changes
  useEffect(() => {
    // Check if payment method actually changed
    if (previousPaymentMethod.current !== paymentMethod) {
      if (paymentMethod === 'on_account') {
        // Reset amount received for on-account orders
        setAmountReceived(0);
      } else if (paymentMethod !== 'on_account') {
        // Only auto-fill if the current amount is 0 AND we have a grand total
        // This prevents overriding user input when they manually change the amount
        if (amountReceived === 0 && grandTotal > 0) {
          setAmountReceived(grandTotal);
        }
      }
      // Update the ref to track the current payment method
      previousPaymentMethod.current = paymentMethod;
    }
  }, [paymentMethod, amountReceived, grandTotal]);

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
              {customers.map((customer: any) => {
                // Get real balance for this customer
                const customerBalance = customerBalances?.find((cb: any) => {
                  // Try multiple ways to match customer ID
                  return cb.customerId === customer.id || 
                         cb.customerId === customer._id || 
                         String(cb.customerId) === String(customer.id) ||
                         String(cb.customerId) === String(customer._id);
                });
                const balance = customerBalance?.balance || 0;
                
                console.log(`🔍 Customer ${customer.firstName} ${customer.lastName}:`, {
                  customerId: customer.id,
                  customer_id: customer._id,
                  foundBalance: customerBalance,
                  balance: balance
                });
                
                return (
                  <Option key={customer.id} value={customer.id}>
                    {customer.firstName} {customer.lastName} - {customer.phone}
                    {balance !== 0 && ` (Balance: ${balance > 0 ? '+' : ''}${balance.toLocaleString()} PKR)`}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          {selectedCustomer && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <Text strong>Selected Customer:</Text>
              <div className="mt-2">
                <div><Text>Name: {selectedCustomer.firstName} {selectedCustomer.lastName}</Text></div>
                <div><Text>Phone: {selectedCustomer.phone}</Text></div>
                
                {/* Customer Balance Details */}
                <div className="mt-3 p-2 bg-white rounded border">
                  <Text strong className="text-sm">Financial Summary:</Text>
                  <div className="mt-2 space-y-1">
                    {balancesLoading ? (
                      <div className="text-sm text-gray-500">🔄 Loading customer balance...</div>
                    ) : (
                      <>
                        <div className="flex justify-between text-sm">
                          <Text>Current Balance:</Text>
                          <span className={selectedCustomer.balance > 0 ? 'text-green-600 font-semibold' : selectedCustomer.balance < 0 ? 'text-red-600 font-semibold' : 'text-neutral-600 font-semibold'}>
                            {selectedCustomer.balance > 0 ? '+' : ''}{selectedCustomer.balance.toLocaleString()} PKR
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500">
                          {selectedCustomer.balance > 0 ? '✅ Customer has advance payment available' : 
                           selectedCustomer.balance < 0 ? '⚠️ Customer owes money' : '✅ Customer is settled'}
                        </div>
                        
                        {/* Show how much customer can spend with advance */}
                        {selectedCustomer.balance > 0 && (
                          <div className="mt-2 p-2 bg-green-50 rounded border-l-4 border-green-400">
                            <Text className="text-sm text-green-700">
                              💰 Customer can spend up to <strong>{selectedCustomer.balance.toLocaleString()} PKR</strong> from advance
                            </Text>
                          </div>
                        )}
                        
                        {/* Show how much customer owes */}
                        {selectedCustomer.balance < 0 && (
                          <div className="mt-2 p-2 bg-red-50 rounded border-l-4 border-red-400">
                            <Text className="text-sm text-red-700">
                              ⚠️ Customer owes <strong>{Math.abs(selectedCustomer.balance).toLocaleString()} PKR</strong>
                            </Text>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Debug Info */}
                <div className="mt-2 text-xs text-gray-400">
                  <div>Debug: Customer ID: {selectedCustomer.id || selectedCustomer._id}</div>
                  <div>Debug: Balance Source: {selectedCustomer.balance !== undefined ? 'API' : 'Default'}</div>
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
                              {productsLoading ? (
                <Option disabled>Loading products...</Option>
              ) : (products || []).map((product: any) => (
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
              label="Payment Method *"
              initialValue="on_account"
              rules={[{ required: true, message: 'Payment method is required' }]}
            >
              <Select onChange={setPaymentMethod}>
                <Option value="on_account">On Account (No Payment)</Option>
                <Option value="cash">Cash</Option>
                <Option value="jazzcash">JazzCash</Option>
                <Option value="bank">Bank Transfer</Option>
                <Option value="card">Card</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="amountReceived"
              label="Amount Received (PKR)"
              rules={[
                {
                  required: paymentMethod !== 'on_account',
                  message: 'Amount received is required for immediate payment'
                }
              ]}
            >
              <InputNumber
                min={0}
                max={grandTotal + Math.max(0, selectedCustomer?.balance || 0)}
                value={amountReceived}
                onChange={(value) => setAmountReceived(value || 0)}
                className="w-full"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                placeholder={paymentMethod === 'on_account' ? 'No payment required' : 'Enter amount received'}
                disabled={paymentMethod === 'on_account'}
              />
            </Form.Item>
          </div>
          
          {/* Payment Validation Messages */}
          {selectedCustomer && (
            <div className="mt-3">
              {paymentMethod === 'on_account' ? (
                <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                  <Text className="text-sm text-blue-700">
                    📝 Order will be created on account - customer will pay later
                  </Text>
                  <div className="text-xs text-blue-600 mt-1">
                    Customer current balance: {selectedCustomer.balance > 0 ? '+' : ''}{selectedCustomer.balance.toLocaleString()} PKR
                  </div>
                </div>
              ) : (
                <>
                  {amountReceived < grandTotal && (
                    <div className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                      <Text className="text-sm text-yellow-700">
                        ⚠️ Amount received ({amountReceived.toLocaleString()} PKR) is less than order total ({grandTotal.toLocaleString()} PKR)
                      </Text>
                    </div>
                  )}
                  
                  {amountReceived > 0 && amountReceived >= grandTotal && (
                    <div className="p-2 bg-green-50 rounded border-l-4 border-green-400">
                      <Text className="text-sm text-green-700">
                        ✅ Payment received: {amountReceived.toLocaleString()} PKR
                      </Text>
                    </div>
                  )}
                  
                  {amountReceived === 0 && (
                    <div className="p-2 bg-red-50 rounded border-l-4 border-red-400">
                      <Text className="text-sm text-red-700">
                        ⚠️ Koi payment nahi mili - amount enter karein
                      </Text>
                    </div>
                  )}
                  
                  {/* Show advance usage if applicable */}
                  {selectedCustomer.balance > 0 && amountReceived < grandTotal && (
                    <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-400 mt-2">
                      <Text className="text-sm text-blue-700">
                        💡 Customer has advance of {selectedCustomer.balance.toLocaleString()} PKR available
                      </Text>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
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
            
            {/* Payment Details */}
            <div className="bg-gray-50 p-3 rounded">
              <Text strong className="text-sm">Payment Details:</Text>
              <div className="mt-2 space-y-1">
                {paymentMethod === 'on_account' ? (
                  <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                    <Text className="text-blue-700">
                      📝 Order will be created on account
                    </Text>
                    <div className="text-xs text-blue-600 mt-1">
                      Customer will pay PKR {grandTotal.toLocaleString()} later
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <Text>Amount Received:</Text>
                      <Text className={`font-semibold ${amountReceived === 0 ? 'text-red-600' : 'text-green-600'}`}>
                        PKR {amountReceived.toLocaleString()}
                      </Text>
                    </div>
                    
                    {/* Show advance usage if applicable */}
                    {selectedCustomer && selectedCustomer.balance > 0 && amountReceived < grandTotal && (
                      <>
                        <div className="flex justify-between text-sm">
                          <Text>Advance Available:</Text>
                          <Text className="text-green-600 font-semibold">PKR {selectedCustomer.balance.toLocaleString()}</Text>
                        </div>
                        <div className="flex justify-between text-sm">
                          <Text>Advance Used:</Text>
                          <Text className="text-blue-600 font-semibold">
                            PKR {Math.min(selectedCustomer.balance, grandTotal - amountReceived).toLocaleString()}
                          </Text>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Balance Impact Info Tab */}
            {selectedCustomer && (
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <Text strong className="text-sm text-blue-800">💡 Balance Impact Information:</Text>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <Text className="text-blue-700">Current Balance:</Text>
                    <span className={selectedCustomer.balance > 0 ? 'text-green-600 font-semibold' : selectedCustomer.balance < 0 ? 'text-red-600 font-semibold' : 'text-neutral-600 font-semibold'}>
                      {selectedCustomer.balance > 0 ? '+' : ''}{selectedCustomer.balance.toLocaleString()} PKR
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <Text className="text-blue-700">Order Total:</Text>
                    <Text className="font-semibold text-blue-700">PKR {grandTotal.toLocaleString()}</Text>
                  </div>
                  
                  <div className="border-t border-blue-200 pt-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <Text className="text-blue-800">After Order Balance:</Text>
                      <span className={(() => {
                        const paymentAmount = paymentMethod === 'on_account' ? 0 : amountReceived;
                        const afterOrderBalance = selectedCustomer.balance - grandTotal + paymentAmount;
                        return afterOrderBalance > 0 ? 'text-green-600' : afterOrderBalance < 0 ? 'text-red-600' : 'text-neutral-600';
                      })()}>
                        {(() => {
                          const paymentAmount = paymentMethod === 'on_account' ? 0 : amountReceived;
                          const afterOrderBalance = selectedCustomer.balance - grandTotal + paymentAmount;
                          return (afterOrderBalance > 0 ? '+' : '') + afterOrderBalance.toLocaleString() + ' PKR';
                        })()}
                      </span>
                    </div>
                    
                    {/* Show warning if amount received is 0 for non-on_account orders */}
                    {paymentMethod !== 'on_account' && amountReceived === 0 && (
                      <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                        <Text className="text-xs text-red-700">
                          ⚠️ <strong>Koi Payment Nahi Mili:</strong> Customer ko poora order amount dena parega
                        </Text>
                      </div>
                    )}
                  </div>
                  
                  {/* Advance Allocation Info */}
                  {selectedCustomer.balance > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <div className="text-xs text-yellow-800">
                        <div className="font-semibold mb-1">💡 Advance Allocation Preview:</div>
                        <div>• Customer Advance: {selectedCustomer.balance.toLocaleString()} PKR</div>
                        <div>• Order Total: {grandTotal.toLocaleString()} PKR</div>
                        {paymentMethod !== 'on_account' && (
                          <div>• Payment Received: {amountReceived.toLocaleString()} PKR</div>
                        )}
                        <div>• Advance to Use: {Math.min(selectedCustomer.balance, grandTotal - (paymentMethod === 'on_account' ? 0 : amountReceived)).toLocaleString()} PKR</div>
                        <div>• Balance Due: {(grandTotal - (paymentMethod === 'on_account' ? 0 : amountReceived) - Math.min(selectedCustomer.balance, grandTotal - (paymentMethod === 'on_account' ? 0 : amountReceived))).toLocaleString()} PKR</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Info Message */}
                  <div className="mt-2 p-2 bg-white rounded border border-blue-300">
                    {(() => {
                      const paymentAmount = paymentMethod === 'on_account' ? 0 : amountReceived;
                      const advanceToUse = Math.min(selectedCustomer.balance, grandTotal - paymentAmount);
                      const balanceDue = grandTotal - paymentAmount - advanceToUse;
                      const remainingAdvance = selectedCustomer.balance - advanceToUse;
                      const afterOrderBalance = selectedCustomer.balance - grandTotal + paymentAmount;
                      
                      // Special case: if payment method is not on_account but amount received is 0
                      if (paymentMethod !== 'on_account' && amountReceived === 0) {
                        return (
                          <div className="text-xs text-red-700">
                            ❌ <strong>Koi Payment Nahi Mili:</strong> Customer ko poora order amount {grandTotal.toLocaleString()} PKR dena parega
                          </div>
                        );
                      }
                      
                      if (remainingAdvance > 0) {
                        return (
                          <div className="text-xs text-green-700">
                            💚 <strong>Advance Remaining:</strong> Customer will have {remainingAdvance.toLocaleString()} PKR advance after this order
                          </div>
                        );
                      } else if (balanceDue > 0) {
                        return (
                          <div className="text-xs text-orange-600">
                            ⚠️ <strong>Extra Paisa Dena Parega:</strong> Customer ko is order ke baad {balanceDue.toLocaleString()} PKR aur dena parega
                          </div>
                        );
                      } else if (afterOrderBalance < 0) {
                        return (
                          <div className="text-xs text-orange-600">
                            ⚠️ <strong>Extra Paisa Dena Parega:</strong> Customer ko is order ke baad {Math.abs(afterOrderBalance).toLocaleString()} PKR aur dena parega
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-xs text-blue-600">
                            ✅ <strong>Perfect Balance:</strong> This order will use exactly the customer's advance{paymentMethod !== 'on_account' ? ' and payment' : ''}
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>
            )}
            
            <Divider />
            <div className="flex justify-between text-lg">
              <Text strong>Final Balance:</Text>
              <Text strong className={(() => {
                if (paymentMethod === 'on_account') {
                  return selectedCustomer && selectedCustomer.balance - grandTotal < 0 ? 'text-red-600' : 'text-green-600';
                } else {
                  // For non-on_account orders, if amount received is 0, show full amount due
                  if (amountReceived === 0) {
                    return 'text-red-600';
                  }
                  return balanceDue > 0 ? 'text-red-600' : 'text-green-600';
                }
              })()}>
                {(() => {
                  if (paymentMethod === 'on_account') {
                    return selectedCustomer ? (selectedCustomer.balance - grandTotal).toLocaleString() : grandTotal.toLocaleString();
                  } else {
                    // For non-on_account orders, if amount received is 0, show full amount due
                    if (amountReceived === 0) {
                      return grandTotal.toLocaleString();
                    }
                    return balanceDue.toLocaleString();
                  }
                })()} PKR
              </Text>
            </div>
            
            {/* Final Status */}
            <div className="text-center p-2 rounded">
              {paymentMethod === 'on_account' ? (
                <div className="bg-blue-50 text-blue-700 p-2 rounded border border-blue-200">
                  <Text strong>📝 Order Created On Account</Text>
                  <div className="text-xs text-blue-600 mt-1">
                    {selectedCustomer && selectedCustomer.balance - grandTotal < 0 ? 
                      `Customer ko ${(grandTotal - selectedCustomer.balance).toLocaleString()} PKR aur dena parega` :
                      selectedCustomer && selectedCustomer.balance - grandTotal > 0 ?
                      `Customer ke pass ${(selectedCustomer.balance - grandTotal).toLocaleString()} PKR advance bachega` :
                      'Customer ka advance bilkul khatam ho jayega'
                    }
                  </div>
                </div>
              ) : amountReceived === 0 ? (
                <div className="bg-red-50 text-red-700 p-2 rounded border border-red-200">
                  <Text strong>❌ Koi Payment Nahi Mili - Poora Amount Due: PKR {grandTotal.toLocaleString()}</Text>
                </div>
              ) : balanceDue <= 0 ? (
                <div className="bg-green-50 text-green-700 p-2 rounded border border-green-200">
                  <Text strong>✅ Order Fully Paid</Text>
                </div>
              ) : (
                <div className="bg-yellow-50 text-yellow-700 p-2 rounded border border-yellow-200">
                  <Text strong>⚠️ Partial Payment - Balance: PKR {balanceDue.toLocaleString()}</Text>
                </div>
              )}
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
            disabled={!selectedCustomer || orderItems.length === 0 || (paymentMethod !== 'on_account' && amountReceived <= 0) || (paymentMethod !== 'on_account' && (amountReceived + Math.max(0, selectedCustomer?.balance || 0)) < grandTotal)}
          >
            {paymentMethod === 'on_account' ? 'Create Order (On Account)' : 'Create Order'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateOrderModal;
