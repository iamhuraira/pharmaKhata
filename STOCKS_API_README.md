# Stocks Management API Documentation

This document describes the backend API endpoints for the PharmaKhata stocks management system.

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Products

#### Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `search` (optional): Search in name, description, and Urdu description
- `category` (optional): Filter by category ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `sortBy` (optional): Sort field (default: 'name')
- `sortOrder` (optional): Sort direction - 'asc' or 'desc' (default: 'asc')

**Example:**
```bash
curl "http://localhost:3000/api/products?search=ALFAFIT&category=6437187b6a285129dc61df46&page=1&limit=10"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "689e18ce99fa6705fd04dd12",
        "name": "ALFAFIT 120ml",
        "shortDescription": "Tonic/ Energatic Digestive",
        "urduDescription": "اعصابی طاقت نظام ہضم کیلۓ",
        "quantity": 20,
        "categoryId": {
          "_id": "6437187b6a285129dc61df46",
          "name": "Saiban Syrups",
          "urduName": "سائبن سیرپس"
        },
        "size": 120,
        "packType": "ml",
        "price": 170,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalProducts": 45,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  },
  "message": "Products retrieved successfully"
}
```

#### Get Single Product
```http
GET /api/products/:id
```

**Example:**
```bash
curl "http://localhost:3000/api/products/689e18ce99fa6705fd04dd12"
```

#### Create New Product
```http
POST /api/products/create
```

**Request Body:**
```json
{
  "name": "New Product",
  "shortDescription": "Product description",
  "urduDescription": "اردو میں تفصیل",
  "quantity": 50,
  "price": 250,
  "size": 100,
  "packType": "ml",
  "categoryId": "6437187b6a285129dc61df46"
}
```

**Required Fields:**
- `name`: Product name
- `packType`: Package type (ml, Tabs, etc.)
- `price`: Product price
- `categoryId`: Category ID

**Optional Fields:**
- `shortDescription`: Short description
- `urduDescription`: Urdu description
- `quantity`: Initial stock quantity (default: 0)
- `size`: Package size

#### Update Product
```http
PUT /api/products/manage/:id
```

**Request Body:**
```json
{
  "quantity": 75,
  "price": 275
}
```

**Updatable Fields:**
- `name`
- `shortDescription`
- `urduDescription`
- `quantity`
- `price`
- `size`
- `packType`
- `categoryId`

#### Delete Product
```http
DELETE /api/products/manage/:id
```

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/products/manage/689e18ce99fa6705fd04dd12"
```

### 2. Product Quantity Management

#### Update Product Quantity
```http
PUT /api/products/update-product-quantity/:id
```

**Request Body:**
```json
{
  "quantity": 100
}
```

**Example:**
```bash
curl -X PUT "http://localhost:3000/api/products/update-product-quantity/689e18ce99fa6705fd04dd12" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 100}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "689e18ce99fa6705fd04dd12",
      "name": "ALFAFIT 120ml",
      "quantity": 100,
      "categoryId": {
        "_id": "6437187b6a285129dc61df46",
        "name": "Saiban Syrups"
      }
    }
  },
  "message": "Product quantity updated successfully"
}
```

### 3. Categories

#### Get All Categories
```http
GET /api/categories
```

**Query Parameters:**
- `search` (optional): Search in name, Urdu name, and description
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `sortBy` (optional): Sort field (default: 'name')
- `sortOrder` (optional): Sort direction (default: 'asc')

**Example:**
```bash
curl "http://localhost:3000/api/categories?search=Syrups"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "_id": "6437187b6a285129dc61df46",
        "name": "Saiban Syrups",
        "urduName": "سائبن سیرپس",
        "description": "Category for Saiban-branded syrups."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCategories": 3,
      "hasNextPage": false,
      "hasPrevPage": false,
      "limit": 50
    }
  },
  "message": "Categories retrieved successfully"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (authentication required)
- `404`: Not Found
- `405`: Method Not Allowed
- `500`: Internal Server Error

## Data Models

### Product Model
```typescript
interface IProduct {
  _id: string;
  name: string;
  shortDescription?: string;
  urduDescription?: string;
  quantity: number;
  categoryId: string;
  size?: number;
  packType: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Category Model
```typescript
interface ICategory {
  _id: string;
  name: string;
  urduName?: string;
  description?: string;
}
```

## Usage Examples

### Frontend Integration

```typescript
// Get all products
const response = await fetch('/api/products?search=ALFAFIT&limit=10');
const data = await response.json();

// Update product quantity
const updateResponse = await fetch(`/api/products/update-product-quantity/${productId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ quantity: 100 })
});

// Create new product
const createResponse = await fetch('/api/products/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'New Product',
    price: 250,
    packType: 'ml',
    categoryId: 'category-id-here'
  })
});
```

## Testing the API

You can test these endpoints using:

1. **cURL commands** (examples provided above)
2. **Postman** or similar API testing tools
3. **Frontend components** that use these endpoints

## Notes

- All timestamps are in ISO 8601 format
- Product names must be unique
- Quantity and price must be non-negative numbers
- Categories are referenced by ID and populated in responses
- Search is case-insensitive and supports partial matches
- Pagination is zero-based (page 1 = first page)
