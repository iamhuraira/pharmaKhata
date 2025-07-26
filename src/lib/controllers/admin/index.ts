import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose, { Types } from 'mongoose';

import { MODELS } from '@/common/constants/common';
import { UserStatus } from '@/common/constants/enums';
import { Role } from '@/common/models/roles';
import { User } from '@/common/models/user';
import { IUser } from '@/common/types/users';
import { getUserByIdOrEmailOrUsernameOrPhone, hashPassword } from '@/common/utils/auth';
import { APIResponse } from '@/common/utils/response';

// create user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, phone, username } = req.body;

    const userExists = await User.findOne({
      $or: [{ email }, { phone }, { username }],
      status: { $ne: UserStatus.DELETED },
    });

    if (userExists) {
      return APIResponse.error(res, 'User already exists', null, StatusCodes.BAD_REQUEST);
    }

    const userRole = await Role.findOne({ name: req.body.role }).populate({
      path: 'permissions',
      select: '-__v',
    });

    if (!userRole) {
      return APIResponse.error(res, 'Role not found', null, StatusCodes.NOT_FOUND);
    }

    const hashedPassword = await hashPassword(req.body.password);

    const newUser = new User(req.body);
    newUser.role = userRole._id as Types.ObjectId;
    newUser.password = hashedPassword;
    newUser.status = UserStatus.ACTIVE;
    newUser.emailVerified = true;
    newUser.phoneVerified = true;
    await newUser.save();

    return APIResponse.success(res, 'User created successfully', { user: newUser });
  } catch (error) {
    return APIResponse.error(res, 'Error creating user', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// get users

export const getUsers = async (req: Request, res: Response) => {
  try {
    // Pagination parameters

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Filter parameters
    const { id, name, email, username, phone, status, role, createdAt, updatedAt } = req.query;
    const filters: Partial<IUser> & { $or?: any[] } & { _id?: string } = {};

    if (id) filters._id = id as string;
    if (email) filters.email = email as string;
    if (username) filters.username = username as string;
    if (phone) filters.phone = phone as string;
    if (status) filters.status = status as UserStatus;
    if (role) filters.role = new mongoose.Types.ObjectId(role as string);
    if (createdAt) filters.createdAt = { $gte: new Date(createdAt as string).toISOString() } as any;
    if (updatedAt) filters.updatedAt = { $gte: new Date(updatedAt as string).toISOString() } as any;

    if (name) {
      const nameRegex = new RegExp(name as string, 'i');
      filters.$or = [{ firstName: { $regex: nameRegex } }, { lastName: { $regex: nameRegex } }];
    }

    // Find users based on filters and pagination
    const usersQuery = User.find(filters)
      .select('-password -__v')
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'role',
        select: '-__v',
        populate: {
          path: 'permissions',
          model: MODELS.PERMISSIONS,
          select: '-__v',
        },
      });

    const [users, count] = await Promise.all([usersQuery, User.countDocuments(filters)]);

    return APIResponse.success(res, 'Users fetched successfully', { total: count, users });
  } catch (error) {
    return APIResponse.error(res, 'Error fetching users', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id = '', email = '' } = req.body;
    if (!id && !email) {
      return APIResponse.error(res, 'ID or Email is required', null, StatusCodes.BAD_REQUEST);
    }

    const user = await getUserByIdOrEmailOrUsernameOrPhone({
      id: id as string,
      email: email as string,
    });

    if (!user) return APIResponse.error(res, 'User not found', null, StatusCodes.NOT_FOUND);

    const { ...updates } = req.body;
    if (req.user?.role?.id === user?.role.toString()) {
      return APIResponse.error(res, 'Admin role can not be changed.', null, StatusCodes.BAD_REQUEST);
    }

    const userRole = await Role.findOne({ name: req.body.role }).populate({
      path: 'permissions',
      select: '-__v',
    });

    if (!userRole) {
      return APIResponse.error(res, 'Role not found', null, StatusCodes.NOT_FOUND);
    }

    const restrictedFields = ['_id', 'email', 'passwordUpdateRequested'];

    for (const field of restrictedFields) {
      if (field in updates) {
        return APIResponse.error(res, `Cannot update ${field}`, null, StatusCodes.BAD_REQUEST);
      }
    }

    if (updates?.password) {
      if (!user.passwordUpdateRequested) {
        return APIResponse.error(res, 'Password update not requested', null, StatusCodes.BAD_REQUEST);
      }
      const hashedPassword = await hashPassword(updates.password);
      updates.password = hashedPassword;
      updates.passwordUpdateRequested = false;
    }

    if (updates.username && !updates.phone) {
      const alreadyExists = await User.findOne({ username: updates.username });
      if (alreadyExists && alreadyExists._id.toString() !== user._id.toString()) {
        return APIResponse.error(res, 'Username already exists', null, StatusCodes.BAD_REQUEST);
      }
    } else if (updates.phone && !updates.username) {
      const alreadyExists = await User.findOne({
        phone: updates.phone,
        phoneVerified: true,
        status: { $ne: UserStatus.DELETED },
      });
      if (alreadyExists && alreadyExists._id.toString() !== user._id.toString()) {
        return APIResponse.error(res, 'Phone number already exists', null, StatusCodes.BAD_REQUEST);
      }
    } else if (updates.phone && updates.username) {
      const alreadyExists = await User.findOne({
        $or: [{ email: updates.email }, { username: updates.username }, { phone: req?.body?.phone }],
      });
      const usernameExists = await User.findOne({ username: updates.username, email: updates.email });
      if (alreadyExists && alreadyExists._id.toString() !== user._id.toString()) {
        return APIResponse.error(
          res,
          `${usernameExists ? 'Username' : 'Phone'} already exists`,
          null,
          StatusCodes.BAD_REQUEST
        );
      }
    }

    Object.assign(user, updates);
    user.role = userRole._id as Types.ObjectId;
    await user.save();

    if (updates?.password) {
      // TODO: Send email to user notifying them of password change
    }
    return APIResponse.success(res, 'User updated successfully', { user });
  } catch (error) {
    return APIResponse.error(res, 'Error updating user', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// block user

export const blockUser = async (req: Request, res: Response) => {
  try {
    const { id, username, email, phone } = req.query;

    if (!id && !email && !username) {
      return APIResponse.error(res, 'ID, Email, or Username is required', null, StatusCodes.BAD_REQUEST);
    }

    const user = await getUserByIdOrEmailOrUsernameOrPhone({
      id: id as string,
      email: email as string,
      username: username as string,
      phone: phone as string,
    });

    if (!user) return APIResponse.error(res, 'User not found', null, StatusCodes.NOT_FOUND);

    if (user.status === UserStatus.BLOCKED) {
      return APIResponse.error(res, 'User is already blocked', null, StatusCodes.BAD_REQUEST);
    }

    if (req.user?.role?.id === user?.role.toString()) {
      return APIResponse.error(res, 'Admin cannot block themselves.', null, StatusCodes.BAD_REQUEST);
    }

    if (user.status === UserStatus.DELETED) {
      return APIResponse.error(res, 'User is already deleted', null, StatusCodes.BAD_REQUEST);
    }

    user.status = UserStatus.BLOCKED;
    await user.save();

    return APIResponse.success(res, 'User blocked successfully', { user });
  } catch (error) {
    return APIResponse.error(res, 'Error blocking user', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// delete user

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { username, id, email } = req.query;

    if (!id && !email && !username) {
      return APIResponse.error(res, 'ID, Email, or Username is required', null, StatusCodes.BAD_REQUEST);
    }
    const query: any = {};
    if (id) query._id = id;
    if (email) query.email = email;
    if (username) query.username = username;

    const user = await User.findOne(query);

    if (!user) return APIResponse.error(res, 'User not found', null, StatusCodes.NOT_FOUND);

    if (user?.status === UserStatus.DELETED) {
      return APIResponse.error(res, 'User is already deleted', null, StatusCodes.BAD_REQUEST);
    }

    if (req.user?.role?.id === user?.role?.toString()) {
      return APIResponse.error(res, 'Admin cannot delete themselves.', null, StatusCodes.BAD_REQUEST);
    }

    user.status = UserStatus.DELETED;
    await user.save();
    return APIResponse.success(res, 'User deleted successfully', { user });
  } catch (error) {
    console.log(error);

    return APIResponse.error(res, 'Error deleting user', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
