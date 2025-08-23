import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  qty: number;
  price: number;
  discount?: number;
  total: number;
}

export interface IOrderPayment {
  method: 'cash' | 'jazzcash' | 'bank' | 'card' | 'advance' | 'other';
  amount: number;
  reference?: string;
  date: Date;
  type: 'advance' | 'payment' | 'refund';
}

export interface IOrderMeta {
  counter?: string;
  salesman?: string;
  notes?: string;
}

export interface IOrderTotals {
  subTotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  amountReceived: number;
  balance: number;
  advanceUsed: number;
  changeGiven?: number;
}

export interface IOrder extends Document {
  orderId: string;
  customer: {
    id: mongoose.Types.ObjectId;
    name: string;
    phone: string;
  };
  items: IOrderItem[];
  notes?: string;
  payment?: IOrderPayment;
  paymentHistory?: IOrderPayment[];
  meta?: IOrderMeta;
  totals: IOrderTotals;
  status: 'created' | 'paid' | 'partial' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'products', required: true },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 }
});

const OrderPaymentSchema = new Schema<IOrderPayment>({
  method: { 
    type: String, 
    required: true, 
    enum: ['cash', 'jazzcash', 'bank', 'card', 'advance', 'other'] 
  },
  amount: { type: Number, required: true, min: 0 },
  reference: { type: String },
  date: { type: Date, default: Date.now },
  type: { 
    type: String, 
    required: true, 
    enum: ['advance', 'payment', 'refund'] 
  }
});

const OrderMetaSchema = new Schema<IOrderMeta>({
  counter: { type: String },
  salesman: { type: String },
  notes: { type: String }
});

const OrderTotalsSchema = new Schema<IOrderTotals>({
  subTotal: { type: Number, required: true, min: 0 },
  discountTotal: { type: Number, default: 0, min: 0 },
  taxTotal: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  amountReceived: { type: Number, default: 0, min: 0 },
  balance: { type: Number, required: true },
  advanceUsed: { type: Number, default: 0, min: 0 },
  changeGiven: { type: Number, default: 0, min: 0 }
});

const OrderSchema = new Schema<IOrder>({
  orderId: { 
    type: String, 
    required: false, 
    unique: true 
  },
  customer: {
    id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true }
  },
  items: [OrderItemSchema],
  notes: { type: String },
  payment: OrderPaymentSchema,
  paymentHistory: [OrderPaymentSchema],
  meta: OrderMetaSchema,
  totals: { type: OrderTotalsSchema, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['created', 'paid', 'partial', 'cancelled', 'completed'],
    default: 'created'
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate orderId
OrderSchema.pre('save', async function(next) {
  try {
    if (this.isNew && !this.orderId) {
      const OrderModel = this.constructor as any;
      const count = await OrderModel.countDocuments();
      this.orderId = `ORD-${String(count + 1).padStart(4, '0')}`;
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to calculate totals
OrderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    // Calculate subtotal (no item-level discounts)
    this.totals.subTotal = this.items.reduce((sum, item) => {
      const itemTotal = item.qty * item.price;
      return sum + itemTotal;
    }, 0);
    
    // Discount total is now managed at order level, not item level
    // Keep existing discountTotal from API calculation
    
    // Calculate grand total (subtotal - order discount + tax)
    this.totals.grandTotal = this.totals.subTotal - this.totals.discountTotal + this.totals.taxTotal;
    
    // Calculate balance
    this.totals.balance = this.totals.grandTotal - this.totals.amountReceived - this.totals.advanceUsed;
    
    // Calculate change given if overpaid
    if (this.totals.amountReceived > this.totals.grandTotal) {
      this.totals.changeGiven = this.totals.amountReceived - this.totals.grandTotal;
      this.totals.balance = 0;
    }
  }
  next();
});

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
