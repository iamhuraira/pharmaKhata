// src/seeders/category.seeder.ts

import { Types } from 'mongoose';

import { Category } from '@/lib/models/category';

export default async function seedCategories() {
  // Optional: Clear existing categories if you want a clean slate
  // await Category.deleteMany({});

  const categoriesToInsert = [
    {
      _id: new Types.ObjectId('6437187b6a285129dc61df44'),
      name: 'Saiban Tablets',
      urduName: 'سائبن ٹیبلٹس',
      description: 'Category for all Saiban-branded tablets.',
    },
    {
      _id: new Types.ObjectId('6437187b6a285129dc61df45'),
      name: 'Saiban Drops',
      urduName: 'سائبن ڈراپس',
      description: 'Category for Saiban-branded drops.',
    },
    {
      _id: new Types.ObjectId('6437187b6a285129dc61df46'),
      name: 'Saiban Syrups',
      urduName: 'سائبن سیرپس',
      description: 'Suggested category for Saiban syrups.',
    },
  ];

  await Category.insertMany(categoriesToInsert);
  console.log('✅ Categories seeded!');
}
