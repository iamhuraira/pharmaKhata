# PharmaKhata Quick Setup Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Environment Setup
Copy the example environment file and configure it:
```bash
cp env.example .env.development
```

Edit `.env.development` and set your MongoDB connection:
```env
MONGO_URL=mongodb://localhost:27017/pharmakhata
JWT_SECRET_KEY=your_secret_key_here
```

## 3. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services
```

## 4. Seed the Database
Run the seeders to populate your database:
```bash
npm run seed
```

This will create:
- System permissions and roles
- Default users (admin, regular users, customers)
- Product categories (Tablets, Drops, Syrups)
- 45+ pharmaceutical products

## 5. Start Development Server
```bash
npm run dev
```

## 6. Access the Application
- **Frontend**: http://localhost:3000
- **API Endpoints**: http://localhost:3000/api/*

## Default Login Credentials

After seeding, you can use these accounts:

| Role | Phone | Password |
|------|-------|----------|
| Super Admin | 03086173323 | 12345Aa! |
| Admin | 03086173324 | 12345Aa! |
| User | 03086173325 | 12345Aa! |
| Customer | 03086173326 | 12345Aa! |

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/me` - Get current user info

### Products
- `GET /api/products` - List all products

### Users
- `GET /api/users` - List all users (admin only)
- `GET /api/users/[id]` - Get specific user

## Troubleshooting

### MongoDB Connection Issues
- Check if MongoDB is running
- Verify connection string in `.env.development`
- Ensure database name is correct

### Seeder Errors
- Check MongoDB connection
- Verify all environment variables are set
- Check console for specific error messages

### Port Conflicts
- Change PORT in `.env.development` if 3000 is busy
- Update CORS_ORIGIN if using different ports

## Next Steps

1. **Customize Products**: Edit `src/seeders/productData.ts`
2. **Add Categories**: Modify `src/seeders/seedCategory.ts`
3. **User Management**: Update `src/seeders/data.ts`
4. **API Development**: Extend existing endpoints in `src/pages/api/`

## Support

For issues or questions:
1. Check the console logs
2. Review the `SEEDERS_README.md` for detailed seeder information
3. Check MongoDB connection and permissions
