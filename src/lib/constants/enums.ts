export enum UserRoles {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
  CUSTOMER = 'customer',
}

export enum UserStatus {
  ACTIVE = 'active', // Active user
  DELETED = 'deleted', // Deleted user itself
  BLOCKED = 'blocked', // Blocked by admin
}

export enum CommonPermissions {
  // common permissions
  GET_ME = 'get_me',
  UPDATE_ME = 'update_me',
  DELETE_ME = 'delete_me',
  UPLOAD_PROFILE_PIC = 'upload_profile_pic',
  CHANGE_PASSWORD_WITH_CURRENT_PASSWORD = 'change_password_with_current_password',

  // Products
  GET_ALL_PRODUCTS = 'get_all_products',
  UPDATE_PRODUCT = 'update_product',

  // Customers
  READ_ALL_CUSTOMERS = 'read_all_customers',
}

export enum CustomerPermissions {}

export enum SuperAdminPermissions {}

export enum AdminPermissions {
  // user
  READ_ALL_USERS = 'read_all_users',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  BLOCK_USER = 'block_user',
  UPDATE_PASSWORD = 'update_password',

  // Customer
  CREATE_CUSTOMER = 'create_customer',
  UPDATE_CUSTOMER = 'update_customer',
  DELETE_CUSTOMER = 'delete_customer',

  // // role
  // CREATE_ROLE = 'create_role',
  // READ_ALL_ROLES = 'read_all_roles',
  // READ_ROLE = 'read_role',
  // UPDATE_ROLE = 'update_role',
  // DELETE_ROLE = 'delete_role',
  // ASSIGN_NEW_PERMISSION_ROLE = 'assign_new_permission_role',
  // CHANGE_USER_ROLE = 'change_user_role',
}
