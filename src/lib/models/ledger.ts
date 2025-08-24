import mongoose, { Schema, Document } from 'mongoose';

export interface ILedgerRef {
  orderId?: string;
  party?: string;
  txnNo?: string;
  voucher?: string;
  customerId?: string;
  productId?: string;
  expenseId?: string;
  [key: string]: any; // Allow additional reference fields
}

export interface ILedgerTransaction extends Document {
  txnId: string;
  date: Date;
  type: 'sale' | 'purchase' | 'payment' | 'expense' | 'company_remit' | 'commission' | 'advance' | 'refund' | 'adjustment' | 'other';
  method: 'cash' | 'jazzcash' | 'bank' | 'card' | 'advance' | 'on_account' | 'other';
  description: string;
  ref?: ILedgerRef;
  credit: number;
  debit: number;
  runningBalance: number;
  month: string; // YYYY-MM format for easy querying
  year: number;
  monthNumber: number;
  day: number;
  createdAt: Date;
  updatedAt: Date;
}

const LedgerRefSchema = new Schema<ILedgerRef>({
  orderId: { type: String },
  party: { type: String },
  txnNo: { type: String },
  voucher: { type: String },
  customerId: { type: Schema.Types.ObjectId, ref: 'users' },
  productId: { type: Schema.Types.ObjectId, ref: 'products' },
  expenseId: { type: Schema.Types.ObjectId, ref: 'expenses' }
}, { _id: false });

const LedgerTransactionSchema = new Schema<ILedgerTransaction>({
  txnId: { 
    type: String, 
    required: false, 
    unique: true 
  },
  date: { 
    type: Date, 
    required: true,
    index: true
  },
  type: { 
    type: String, 
    required: true,
    enum: ['sale', 'purchase', 'payment', 'expense', 'company_remit', 'commission', 'advance', 'refund', 'adjustment', 'other']
  },
  method: { 
    type: String, 
    required: true,
    enum: ['cash', 'jazzcash', 'bank', 'card', 'advance', 'on_account', 'other']
  },
  description: { 
    type: String, 
    required: true 
  },
  ref: LedgerRefSchema,
  credit: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 0
  },
  debit: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 0
  },
  runningBalance: { 
    type: Number, 
    required: true 
  },
  month: { 
    type: String, 
    required: false,
    index: true
  },
  year: { 
    type: Number, 
    required: false,
    index: true
  },
  monthNumber: { 
    type: Number, 
    required: false,
    index: true
  },
  day: { 
    type: Number, 
    required: false,
    index: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate txnId and date fields
LedgerTransactionSchema.pre('save', async function(next) {
  try {
    // Generate txnId if not provided
    if (this.isNew && !this.txnId) {
      const count = await mongoose.model('LedgerTransaction').countDocuments();
      this.txnId = `TXN-${String(count + 1).padStart(6, '0')}`;
    }
    
    // Always set date fields for easy querying
    const date = this.date ? new Date(this.date) : new Date();
    this.year = date.getFullYear();
    this.monthNumber = date.getMonth() + 1;
    this.day = date.getDate();
    this.month = `${this.year}-${String(this.monthNumber).padStart(2, '0')}`;
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to calculate running balance
LedgerTransactionSchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      // Get the last transaction to calculate running balance
      const lastTransaction = await mongoose.model('LedgerTransaction').findOne()
        .sort({ date: -1, createdAt: -1 })
        .lean();
      
      const lastBalance = lastTransaction ? (lastTransaction as any).runningBalance : 0;
      const currentTransactionImpact = (this.credit || 0) - (this.debit || 0);
      
      // Calculate new running balance
      this.runningBalance = lastBalance + currentTransactionImpact;
      
      console.log(`🔍 Ledger Transaction: Credit=${this.credit}, Debit=${this.debit}, Impact=${currentTransactionImpact}, Last Balance=${lastBalance}, New Balance=${this.runningBalance}`);
    }
    
    next();
  } catch (error) {
    console.error('Error calculating running balance:', error);
    // Set a default running balance if calculation fails
    this.runningBalance = 0;
    next();
  }
});

// Indexes for performance
LedgerTransactionSchema.index({ month: 1, date: 1 });
LedgerTransactionSchema.index({ type: 1, method: 1 });
LedgerTransactionSchema.index({ runningBalance: 1 });

export const LedgerTransaction = mongoose.models.LedgerTransaction || mongoose.model<ILedgerTransaction>('LedgerTransaction', LedgerTransactionSchema);
