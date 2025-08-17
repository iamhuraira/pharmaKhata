# PharmaKhata Seeder System

This document explains how to use the seeder system to populate your database with initial data.

## Overview

The seeder system creates the following data in order:
1. **Permissions** - System-wide permissions for different user roles
2. **Roles** - User roles with associated permissions
3. **Users** - Default users with different roles
4. **Categories** - Product categories (Saiban Tablets, Drops, Syrups)
5. **Products** - Pharmaceutical products in each category

## Prerequisites

1. **MongoDB Connection**: Ensure your MongoDB is running and accessible
2. **Environment Variables**: Set up your `.env.development` file with:
   ```env
   MONGO_URL=mongodb://localhost:27017/pharmakhata
   NODE_ENV=development
   ```

## Running the Seeders

### Option 1: Using npm script (Recommended)
```bash
npm run seed
```

### Option 2: Direct execution
```bash
npx tsx src/seeders/index.ts
```

## What Gets Created

### 1. Permissions
- **Common Permissions**: Basic user permissions (get_me, update_me, etc.)
- **Customer Permissions**: Customer-specific permissions (view_orders, place_orders, etc.)
- **Admin Permissions**: Administrative permissions (create_user, delete_user, etc.)
- **Super Admin Permissions**: System-level permissions (manage_admins, system_settings, etc.)

### 2. Roles
- **super_admin**: Full system access
- **admin**: Administrative access
- **user**: Standard user access
- **customer**: Customer-specific access

### 3. Default Users
- **Super Admin**: `03086173323` / `12345Aa!`
- **Admin**: `03086173324` / `12345Aa!`
- **User**: `03086173325` / `12345Aa!`
- **Customer**: `03086173326` / `12345Aa!`

### 4. Product Categories
- **Saiban Tablets**: For tablet medications
- **Saiban Drops**: For liquid drop medications
- **Saiban Syrups**: For syrup medications

### 5. Products
- **45+ pharmaceutical products** across all categories
- Each product includes:
  - Name (English & Urdu)
  - Description
  - Quantity, Size, Pack Type
  - Price
  - Category association

## Seeder Order

The seeders run in a specific order to maintain referential integrity:

```typescript
// 1. Permissions first (no dependencies)
await seedPermissions();

// 2. Roles (depends on permissions)
await seedRoles();

// 3. Users (depends on roles)
await seedUsers();

// 4. Categories (no dependencies)
await seedCategories();

// 5. Products (depends on categories)
await seedProducts();
```

## Customization

### Adding New Products
Edit `src/seeders/productData.ts` to add new products:

```typescript
{
  name: 'New Product',
  shortDescription: 'Product description',
  urduDescription: 'اردو میں تفصیل',
  quantity: 20,
  categoryId: SAIBAN_TABLETS_ID,
  size: 30,
  packType: 'Tabs',
  price: 250,
}
```

### Adding New Categories
Edit `src/seeders/seedCategory.ts` to add new categories:

```typescript
{
  _id: new Types.ObjectId('unique_id_here'),
  name: 'New Category',
  urduName: 'نیا زمرہ',
  description: 'Category description',
}
```

### Modifying Users
Edit `src/seeders/data.ts` to modify default users or add new ones.

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify MONGO_URL in environment variables
   - Ensure network access to MongoDB

2. **Permission Denied Errors**
   - Check MongoDB user permissions
   - Verify database name in connection string

3. **Duplicate Key Errors**
   - Seeders use `upsert: true` to avoid duplicates
   - If issues persist, clear the database first

4. **Password Hashing Issues**
   - **Problem**: Users created by seeders can't login due to password hash mismatch
   - **Cause**: bcrypt library version differences or salt round mismatches
   - **Solution**: Re-run seeders after fixing the hashing logic
   - **Note**: The seeder now uses `bcrypt.hash(password, 10)` directly for consistency

### Resetting Data

To start fresh, you can:
1. Drop the database: `mongo pharmakhata --eval "db.dropDatabase()"`
2. Run seeders again: `npm run seed`

## Development

### Adding New Seeders

1. Create a new seeder file in `src/seeders/`
2. Export a default async function
3. Import and call it in `src/seeders/index.ts`

Example:
```typescript
// src/seeders/seedNewData.ts
export default async function seedNewData() {
  // Your seeding logic here
  console.log('✅ New data seeded!');
}

// src/seeders/index.ts
import seedNewData from './seedNewData';
// ... in seedDatabase function
await seedNewData();
```

### Testing Seeders

You can test individual seeders by importing and running them:

```typescript
import seedProducts from '@/seeders/seedProduct';

// Test just products
await seedProducts();
```

## Production Notes

- Seeders are designed for development/staging environments
- For production, consider using migration scripts instead
- Always backup data before running seeders in production
- Review and customize data according to production requirements
