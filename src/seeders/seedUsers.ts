import bcrypt from 'bcrypt';
import { Role } from '@/lib/models/roles';
import { User } from '@/lib/models/user';

import { users } from './data';

const seedUsers = async () => {
  try {
    const roles = await Role.find({});

    if (roles.length === 0) {
      console.log('Please seed roles first');
      return;
    }

    const roleMap = roles.reduce(
      (map, role) => {
        map[role.name] = role._id;
        return map;
      },
      {} as { [key: string]: any }
    );

    console.log('Seeding users...');

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      console.log(`Hashing password for ${user.firstName} ${user.lastName} (${user.phone}): ${hashedPassword.substring(0, 20)}...`);
      
      await User.findOneAndUpdate(
        { phone: user.phone },
        {
          ...user,
          password: hashedPassword,
          role: roleMap[user.role],
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log('Users seeded!');
  } catch (err) {
    console.log(err);
    throw new Error('Something went wrong while seeding users');
  }
};

export default seedUsers;
