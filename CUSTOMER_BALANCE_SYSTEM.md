# Customer Balance System

## Overview

The customer balance system has been completely refactored to properly handle customer balances through ledger transactions instead of a non-existent `balance` field on the User model. This system now accurately tracks customer debt, advance payments, and order balances.

## How It Works

### 1. Balance Calculation Logic

Customer balance is calculated from ledger transactions using this formula:

```
Customer Balance = Total Credits - Total Debits
```

Where:
- **Total Credits** = Payments received + Advance payments
- **Total Debits** = Sales/Orders (amounts customer owes)
- **Advance Allocation** = Handled internally in order totals (no separate ledger transactions)

### 2. Balance Interpretation

- **Positive Balance (+ve)**: Customer has advance credit (you owe them money)
- **Negative Balance (-ve)**: Customer owes you money
- **Zero Balance (0)**: Customer account is balanced

### 3. Transaction Types

#### Sales/Orders (`type: 'sale'`)
- **Debit**: Increases what customer owes
- **Credit**: 0
- **Impact**: Customer owes more money

#### Payments (`type: 'payment'`)
- **Debit**: 0
- **Credit**: Reduces what customer owes
- **Impact**: Customer pays off debt

#### Advance Payments (`type: 'advance'`)
- **Debit**: 0
- **Credit**: Customer gives advance money
- **Impact**: Customer builds up credit

#### Advance Allocations
- **No separate ledger transactions** - handled internally in order totals
- **Impact**: Reduces effective debt when calculating order balance

## API Endpoints

### 1. Create Order (`POST /api/orders`)
- Handles regular orders with payments
- Automatically allocates available advance balance
- Creates ledger transactions for order and advance allocation

### 2. Create On-Account Order (`POST /api/orders/create-on-account`)
- Creates orders with full amount due
- No advance allocation
- Customer owes the full order amount

### 3. Customer Payment (`POST /api/customers/[id]/payments`)
- Records customer payments
- Automatically determines if payment is for debt or advance
- Updates customer balance through ledger transactions

### 4. Customer Balance (`GET /api/customers/balance`)
- Returns current customer balance
- Provides detailed balance breakdown
- Shows balance status and formatted amounts

## Example Scenarios

### Scenario 1: Customer with Advance
```
Initial State: Customer has +2,000 PKR advance
New Order: 5,000 PKR
Result: 
- Advance used: 2,000 PKR
- Balance due: 3,000 PKR
- Final balance: -3,000 PKR (customer owes 3,000 PKR)
```

**Transaction Flow:**
1. Customer gives advance: +2,000 PKR (credit)
2. Customer creates order: -5,000 PKR (debit) 
3. **No separate advance allocation transaction** - handled internally
4. **Final balance: -3,000 PKR** (customer owes 3,000 PKR)

**Calculation:**
- Total Credits: 2,000 PKR (advance)
- Total Debits: 5,000 PKR (order)
- **Final Balance: 2,000 - 5,000 = -3,000 PKR**
- **Customer owes: 3,000 PKR**

**Advance allocation is handled internally:**
- Order total: 5,000 PKR
- Advance used: 2,000 PKR  
- **Net amount due: 3,000 PKR**

### Scenario 2: On-Account Order with Advance
```
Initial State: Customer has +2,000 PKR advance
New Order: 5,000 PKR (on account)
Result:
- Advance used: 2,000 PKR (auto-allocated)
- Balance due: 3,000 PKR
- Final balance: -3,000 PKR (customer owes 3,000 PKR)
```

### Scenario 3: On-Account Order without Advance
```
Initial State: Customer has 0 PKR balance
New Order: 5,000 PKR (on account)
Result:
- Advance used: 0 PKR
- Balance due: 5,000 PKR
- Final balance: -5,000 PKR (customer owes 5,000 PKR)
```

### Scenario 4: Customer Payment
```
Initial State: Customer owes -3,000 PKR
Payment: 2,000 PKR
Result:
- New balance: -1,000 PKR (customer still owes 1,000 PKR)
- Payment reduces debt
```

## Frontend Display Logic

### Order Management Table
The frontend now properly displays:
- **Total**: Order grand total (PKR 5,000)
- **Payment**: Amount received + Advance used + Balance due
- **Advance Used**: Shows when customer's advance is allocated
- **Balance Due**: Correctly calculated as (Total - Amount Received - Advance Used)

### Example Display
```
Order: PKR 5,000
Payment: PKR 0
       Advance: PKR 2,000
       Due: PKR 3,000
```

## Recent Fixes Applied

### 1. Fixed Advance Allocation Logic
- ✅ **Removed problematic advance allocation transactions** that were creating incorrect credits
- ✅ Balance calculation now uses: Total Credits - Total Debits (simple and correct)
- ✅ Final balance shows correct due amount: **3,000 PKR** (not 1,000 PKR)
- ✅ **No more separate ledger transactions for advance allocation** - handled internally

### 2. Updated Order Creation Flow
- ✅ Regular orders: Advance auto-allocated, remaining amount due
- ✅ On-account orders: Advance can still be used, remaining amount due
- ✅ All orders: **Only sales transaction created** (no extra advance allocation transactions)
- ✅ Advance allocation handled internally in order totals

### 3. Frontend Display Updates
- ✅ Payment column shows: Amount received + Advance used + Balance due
- ✅ Total column uses order totals for accuracy
- ✅ Actions column shows Pay button only when balance is due

### 4. Balance Calculation Consistency
- ✅ Backend and frontend use same calculation logic
- ✅ All APIs return consistent balance information
- ✅ Utility functions ensure accuracy across the system
- ✅ **Simplified calculation: Credits - Debits = Balance**

## Utility Functions

### `calculateCustomerBalance(customerId)`
- Calculates current balance from ledger transactions
- Returns detailed balance breakdown
- Used across all APIs for consistency

### `getCustomerBalanceSummary(customerId)`
- Provides formatted balance information
- Includes status and user-friendly messages
- Used for display purposes

### `calculateBalanceAfterOrder(customerId, orderAmount)`
- Calculates what balance will be after a new order
- Useful for order preview and validation
- Returns formatted messages about balance impact

## Database Schema

### LedgerTransaction Model
```typescript
interface ILedgerTransaction {
  type: 'sale' | 'payment' | 'advance' | 'refund' | 'adjustment' | 'other';
  method: 'cash' | 'jazzcash' | 'bank' | 'card' | 'advance' | 'on_account' | 'other';
  credit: number;  // Money received
  debit: number;   // Money owed
  ref: {
    customerId: ObjectId;
    orderId?: string;
    party: string;
    txnNo?: string;
  };
}
```

### Order Model
```typescript
interface IOrder {
  totals: {
    grandTotal: number;
    amountReceived: number;
    advanceUsed: number;
    balance: number;  // Amount still due
  };
  payment: {
    method: 'on_account' | 'cash' | 'jazzcash' | 'bank' | 'card';
    type: 'on_account' | 'payment' | 'advance';
  };
}
```

## Migration Notes

### What Changed
1. Removed dependency on non-existent `balance` field in User model
2. All balance calculations now use ledger transactions
3. Created utility functions for consistent balance calculation
4. Added dedicated on-account order creation endpoint
5. Improved error handling and validation
6. **Fixed advance allocation logic** - advance allocations now properly reduce effective debt

### What's New
1. `calculateCustomerBalance()` utility function
2. `getCustomerBalanceSummary()` utility function
3. `calculateBalanceAfterOrder()` utility function
4. `/api/orders/create-on-account` endpoint
5. Enhanced balance information in API responses
6. **Corrected balance calculation formula** - uses effective debits instead of total debits

### Benefits
1. **Accurate**: Balance always reflects actual transactions with proper advance allocation
2. **Consistent**: Same calculation logic across all APIs
3. **Maintainable**: Centralized balance calculation logic
4. **Flexible**: Supports all payment methods and scenarios
5. **Auditable**: Full transaction history in ledger
6. **Correct**: Properly handles advance allocations and shows accurate due amounts

## Testing

To test the system:

1. **Create a customer** with advance payment
2. **Create an order** and verify advance allocation
3. **Create an on-account order** and verify balance calculation
4. **Record a payment** and verify balance update
5. **Check balance API** for accurate calculations

### Test Endpoints
- `/api/test/balance-calculation?customerId=123&orderAmount=5000` - Test balance calculation
- `/api/test/scenario-test?customerId=123` - Test complete scenario flow
- `/api/test/simple-math?advance=2000&order=5000` - Test basic math

## Error Handling

The system includes comprehensive error handling:
- Database connection errors
- Invalid customer/product IDs
- Insufficient stock validation
- Transaction rollback on failures
- Detailed error messages for debugging

## Recent Fixes Applied

### 1. Fixed Advance Allocation Logic
- ✅ Advance allocations now properly reduce effective debt
- ✅ Balance calculation uses: Total Credits - (Total Debits - Advance Allocations)
- ✅ Final balance shows correct due amount: **3,000 PKR** (not 1,000 PKR)

### 2. Updated Order Creation Flow
- ✅ Regular orders: Advance auto-allocated, remaining amount due
- ✅ On-account orders: Advance can still be used, remaining amount due
- ✅ All orders: Proper ledger transactions created

### 3. Frontend Display Updates
- ✅ Payment column shows: Amount received + Advance used + Balance due
- ✅ Total column uses order totals for accuracy
- ✅ Actions column shows Pay button only when balance is due

### 4. Balance Calculation Consistency
- ✅ Backend and frontend use same calculation logic
- ✅ All APIs return consistent balance information
- ✅ Utility functions ensure accuracy across the system

## Future Enhancements

1. **Credit Limits**: Add customer credit limit validation
2. **Payment Plans**: Support for installment payments
3. **Interest Calculation**: Add interest on overdue balances
4. **Balance Alerts**: Notifications for high balances
5. **Reporting**: Enhanced balance and payment reports

## Order Creation Flow

### 1. **Full On-Account Order**
- Customer creates order: 5,000 PKR
- Customer pays: 0 PKR
- **Result**: Customer owes 5,000 PKR (on-account)
- **Ledger**: Single sale transaction with debit 5,000 PKR

### 2. **Partial Payment Order**
- Customer creates order: 5,000 PKR
- Customer pays: 2,000 PKR
- **Result**: Customer owes 3,000 PKR (on-account for remaining balance)
- **Ledger**: Single sale transaction with debit 3,000 PKR (NET amount owed)

### 3. **Full Payment Order**
- Customer creates order: 5,000 PKR
- Customer pays: 5,000 PKR
- **Result**: Customer owes 0 PKR (fully paid)
- **Ledger**: Single sale transaction with debit 0 PKR (no debt)

### 4. **Order with Advance**
- Customer has advance: 2,000 PKR
- Customer creates order: 5,000 PKR
- **Result**: Customer owes 3,000 PKR (after using advance)
- **Ledger**: Single sale transaction with debit 3,000 PKR (NET amount owed)
- **Advance allocation**: Handled internally in order totals (no separate transaction)

## Key Principle:
**The ledger transaction shows the NET amount the customer owes after all payments and advance allocations. No additional transactions are needed that would double-count the debt.**