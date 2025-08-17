import mongoose, { Document, Schema } from 'mongoose';
import { MODELS } from '../constants/common';

export interface IExpense extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  amount: number;
  category: string;
  expenseDate: Date;
  paymentMethod: string;
  receipt?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'inventory',
      'shipping',
      'marketing',
      'utilities',
      'rent',
      'salaries',
      'maintenance',
      'other'
    ],
  },
  expenseDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'bank_transfer', 'easypaisa', 'jazzcash', 'other'],
  },
  receipt: {
    type: String,
  },
  notes: {
    type: String,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: MODELS.USERS,
    required: true,
  },
}, {
  timestamps: true,
});

// Prevent duplicate model compilation
let Expense: mongoose.Model<IExpense>;
try {
  Expense = mongoose.model<IExpense>(MODELS.EXPENSES);
} catch {
  Expense = mongoose.model<IExpense>(MODELS.EXPENSES, expenseSchema);
}

export { Expense };
