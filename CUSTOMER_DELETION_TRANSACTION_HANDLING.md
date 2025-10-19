# Customer Deletion with Transaction Handling

## Overview

The enhanced customer deletion system now properly handles related transactions and orders when deleting a customer. This ensures data integrity while providing flexibility for different business scenarios.

## Transaction Handling Strategies

### 1. **Preserve All Data** (`preserve`)
- **What it does**: Keeps all transactions and orders as-is
- **When to use**: When customer has no transactions or when you want to maintain complete audit trail
- **Result**: Customer marked as inactive, all data remains accessible

```typescript
// API Call
DELETE /api/customers/123?strategy=preserve

// Result
{
  "success": true,
  "message": "Customer deactivated successfully",
  "data": {
    "transactionHandling": {
      "strategy": "preserve",
      "transactionsHandled": 0,
      "ordersHandled": 0,
      "details": {
        "transactionsUpdated": 0,
        "ordersUpdated": 0
      }
    }
  }
}
```

### 2. **Soft Delete (Recommended)** (`soft_delete`)
- **What it does**: Marks transactions and orders as deleted but keeps them in database
- **When to use**: Most common scenario - maintains audit trail while hiding data
- **Result**: Customer and related data marked as deleted, still queryable for reports

```typescript
// API Call
DELETE /api/customers/123?strategy=soft_delete

// Result
{
  "success": true,
  "data": {
    "transactionHandling": {
      "strategy": "soft_delete",
      "transactionsHandled": 15,
      "ordersHandled": 8,
      "details": {
        "transactionsUpdated": 15,
        "ordersUpdated": 8
      }
    }
  }
}
```

### 3. **Hard Delete (Dangerous)** (`hard_delete`)
- **What it does**: Permanently deletes all transactions and orders
- **When to use**: Only when you're absolutely sure you want to remove all traces
- **Result**: Customer and all related data permanently removed

```typescript
// API Call
DELETE /api/customers/123?strategy=hard_delete

// Result
{
  "success": true,
  "data": {
    "transactionHandling": {
      "strategy": "hard_delete",
      "transactionsHandled": 15,
      "ordersHandled": 8,
      "details": {
        "transactionsDeleted": 15,
        "ordersDeleted": 8
      }
    }
  }
}
```

### 4. **Archive to Another Customer** (`archive`)
- **What it does**: Transfers all transactions and orders to another customer
- **When to use**: When merging customers or transferring business
- **Result**: Customer deleted, data transferred to archive customer

```typescript
// API Call
DELETE /api/customers/123?strategy=archive&archiveCustomerId=456

// Result
{
  "success": true,
  "data": {
    "transactionHandling": {
      "strategy": "archive",
      "transactionsHandled": 15,
      "ordersHandled": 8,
      "details": {
        "transactionsArchived": 15,
        "ordersArchived": 8
      }
    }
  }
}
```

## Database Changes

### Soft Delete Strategy
```javascript
// Transactions are updated with:
{
  deletedAt: new Date(),
  deletedBy: 'system',
  status: 'deleted'
}

// Orders are updated with:
{
  deletedAt: new Date(),
  deletedBy: 'system',
  status: 'cancelled'
}
```

### Archive Strategy
```javascript
// Transactions are updated with:
{
  'ref.customerId': newCustomerId,
  'ref.originalCustomerId': originalCustomerId,
  'ref.archivedAt': new Date(),
  'ref.archivedBy': 'system'
}

// Orders are updated with:
{
  'customer.id': newCustomerId,
  'customer.originalId': originalCustomerId,
  'customer.archivedAt': new Date(),
  'customer.archivedBy': 'system'
}
```

## Frontend Usage

### 1. **Validation with Strategies**
```typescript
// Get validation data including strategies
const response = await fetch('/api/customers/123?validate=true');
const data = await response.json();

// Available strategies
data.transactionStrategies = [
  {
    id: 'preserve',
    name: 'Preserve All Data',
    description: 'Keep all transactions and orders as-is...',
    recommended: false,
    warning: null
  },
  {
    id: 'soft_delete',
    name: 'Soft Delete (Recommended)',
    description: 'Mark transactions as deleted but keep them...',
    recommended: true,
    warning: null
  }
  // ... more strategies
];

// Available customers for archiving
data.archiveCustomers = [
  { id: '456', name: 'John Doe', phone: '+1234567890' },
  // ... more customers
];
```

### 2. **Deletion with Strategy**
```typescript
// Delete with soft delete strategy
await fetch('/api/customers/123?strategy=soft_delete', {
  method: 'DELETE'
});

// Delete with archive strategy
await fetch('/api/customers/123?strategy=archive&archiveCustomerId=456', {
  method: 'DELETE'
});

// Force delete with hard delete strategy
await fetch('/api/customers/123?force=true&strategy=hard_delete', {
  method: 'DELETE'
});
```

## UI Components

### CustomerDeletionModal
The modal now includes:
- **Strategy Selection**: Radio buttons for each strategy
- **Archive Customer Selection**: Dropdown when archive strategy is selected
- **Strategy Descriptions**: Clear explanations of what each strategy does
- **Warnings**: Alerts for dangerous operations
- **Recommendations**: System suggests best strategy based on data

## Best Practices

### 1. **Choose the Right Strategy**
- **No transactions**: Use `preserve` or `soft_delete`
- **Has transactions**: Use `soft_delete` (recommended)
- **Merging customers**: Use `archive`
- **Complete removal**: Use `hard_delete` (with extreme caution)

### 2. **Data Integrity**
- Always validate before deletion
- Use soft delete for audit trails
- Archive when transferring business
- Hard delete only when absolutely necessary

### 3. **User Experience**
- Show clear warnings for dangerous operations
- Explain what each strategy does
- Require confirmation for destructive actions
- Provide detailed feedback on what was done

## Error Handling

```typescript
// Handle validation errors
if (!validation.canDelete && !forceDelete) {
  return {
    success: false,
    message: 'Cannot delete customer due to existing relationships',
    data: { validation, details }
  };
}

// Handle transaction handling errors
if (!transactionResult.success) {
  return {
    success: false,
    message: 'Failed to handle customer transactions',
    data: { transactionResult }
  };
}
```

## Monitoring and Logging

All deletion operations are logged with:
- Customer ID and name
- Selected strategy
- Number of transactions/orders handled
- Timestamp and user who performed deletion
- Detailed results of the operation

This comprehensive approach ensures data integrity while providing the flexibility needed for different business scenarios.
