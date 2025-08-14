import { AdminPermissions, CommonPermissions, CustomerPermissions, UserRoles } from '@/lib/constants/enums';
import { Permission } from '@/lib/models/permissions';
import { Role } from '@/lib/models/roles';

const seedRoles = async () => {
  try {
    const permissions = await Permission.find({});

    if (permissions.length === 0) {
      console.log('Please seed permissions first');
      return;
    }

    const permissionMap = permissions.reduce(
      (map, perm) => {
        map[perm.name] = perm._id;
        return map;
      },
      {} as { [key: string]: any }
    );

    const roles = [
      { name: UserRoles.SUPER_ADMIN, permissions: Object.values(permissionMap) },
      {
        name: UserRoles.ADMIN,
        permissions: Object.values({ ...AdminPermissions, ...CommonPermissions }).map((perm) => permissionMap[perm]),
      },
      {
        name: UserRoles.USER,
        permissions: Object.values(CommonPermissions).map((perm) => permissionMap[perm]),
      },
      {
        name: UserRoles.CUSTOMER,
        permissions: Object.values(CustomerPermissions).map((perm) => permissionMap[perm]),
      },
    ];

    console.log('Seeding roles...');

    await Promise.all(
      roles.map((role) =>
        Role.findOneAndUpdate(
          { name: role.name },
          { name: role.name, permissions: role.permissions },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      )
    );

    console.log('Roles seeded!');
  } catch (err) {
    console.log(err);
    throw new Error('Something went wrong while seeding roles');
  }
};

export default seedRoles;
