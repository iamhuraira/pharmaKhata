import mongoose from 'mongoose';

import { env } from '@/config/envConfig';

import seedProducts from '@/seeders/seedProduct';
import seedCategories from '@/seeders/seedCategory';
import seedPermissions from './seedPermissions';
import seedRoles from './seedRoles';
import seedUsers from './seedUsers';

const { MONGO_URL } = env;

const seedDatabase = async () => {
  mongoose
    .connect(MONGO_URL)
    .then(async () => {
      console.log('Connected to Mongo DB');
      
      // First drop the database to start fresh
      console.log('Dropping existing database...');
      await mongoose.connection.dropDatabase();
      console.log('Database dropped successfully');
      
      // Now seed the data
      console.log('Starting to seed data...');
      await seedPermissions();
      await seedRoles();
      await seedUsers();
      await seedCategories();
      await seedProducts();
      console.log('Database seeding completed successfully');
    })
    .catch((err) => {
      console.log('Something went wrong while seeding'), JSON.stringify(err);
    })
    .finally(() => {
      mongoose.connection.close();
    });
};

seedDatabase();
