import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { UserRoles, UserStatus } from '@/common/constants/enums';
import { Role } from '@/common/models/roles';
import { User } from '@/common/models/user';
import { APIResponse } from '@/common/utils/response';

// Get all customers
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const role = await Role.findOne({ name: UserRoles.CUSTOMER }).exec();
    const customers = await User.find({ role: role?.id }).select('-password -accessToken').exec();
    return APIResponse.success(res, 'Customers fetched successfully', { customers }, StatusCodes.OK);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return APIResponse.error(res, 'Error fetching customers', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Create a new customer
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone } = req.body;
    console.log('req.body:', req.body);
    const role = await Role.findOne({ name: UserRoles.CUSTOMER }).exec();
    if (!role) return APIResponse.error(res, 'Role not found', null, StatusCodes.NOT_FOUND);

    let customer = await User.findOne({ phone }).exec();

    if (!customer) {
      const hashedPassword = await bcrypt.hash('12345!a', 10);
      customer = new User({
        firstName,
        lastName,
        phone,
        password: hashedPassword,
        role: role.id,
        status: UserStatus.ACTIVE,
        phoneVerified: true,
      });
      await customer.save();
    }
    return APIResponse.success(res, 'Customer created successfully', StatusCodes.CREATED);
  } catch (error) {
    console.error('Error creating customer:', error);
    return APIResponse.error(res, 'Error creating customer', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
