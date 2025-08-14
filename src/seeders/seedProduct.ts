import { Product } from '@/lib/models/product';
import { products } from '@/seeders/productData';

export default async function seedProducts() {
  // Optional: clear existing products before seeding
  // await Product.deleteMany({});

  await Product.insertMany(products);
  console.log('✅ Products seeded!');
}
