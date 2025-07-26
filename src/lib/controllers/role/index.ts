import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose, { isValidObjectId } from 'mongoose';

import { UserRoles } from '@/common/constants/enums';
import { Permission } from '@/common/models/permissions';
import { Role } from '@/common/models/roles';
import { User } from '@/common/models/user';
import { APIResponse } from '@/common/utils/response';

export const createRole = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return APIResponse.error(res, 'Role details are required', null, StatusCodes.BAD_REQUEST);
    }

    const { permissions, name } = req.body;

    if (!permissions || permissions.length === 0) {
      return APIResponse.error(res, 'Role must have at least one permission', null, StatusCodes.BAD_REQUEST);
    }

    // validate permissions exist in db
    for (const permissionId of permissions) {
      if (!isValidObjectId(permissionId)) {
        return APIResponse.error(res, 'Invalid permission ID', null, StatusCodes.BAD_REQUEST);
      }
      const permission = await Permission.findById(permissionId);
      if (!permission) {
        return APIResponse.error(res, 'Permission not found', { permissionId }, StatusCodes.NOT_FOUND);
      }
    }

    const role = new Role({
      name,
      permissions,
    });
    await role.save();
    return APIResponse.success(res, 'Role created successfully', { role }, StatusCodes.CREATED);
  } catch (error) {
    console.error('Error creating role:', error);
    return APIResponse.error(res, 'Error creating role', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (page <= 0 || limit <= 0) {
      return APIResponse.error(res, 'Invalid page or limit value', null, StatusCodes.BAD_REQUEST);
    }

    const totalCount = await Role.countDocuments();
    const roles = await Role.find().populate('permissions').skip(skip).limit(limit);

    if (roles.length === 0) {
      return APIResponse.error(res, 'No roles found', null, StatusCodes.NOT_FOUND);
    }

    //   const totalPages = Math.ceil(totalCount / limit);

    return APIResponse.success(
      res,
      'Successfully retrieved roles',
      {
        total: totalCount,
        roles,
      },
      StatusCodes.OK
    );
  } catch (error) {
    console.error('Error fetching roles:', error);
    return APIResponse.error(res, 'Failed to fetch roles', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const getSingleRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    if (!id) {
      return APIResponse.error(res, 'Role ID is required', null, StatusCodes.BAD_REQUEST);
    }

    const role = await Role.findById(id).populate('permissions');
    if (!role) {
      return APIResponse.error(res, 'Role not found', null, StatusCodes.NOT_FOUND);
    }
    return APIResponse.success(res, 'Role retrieved successfully', { role });
  } catch (error) {
    console.error('Error fetching role by ID:', error);
    return APIResponse.error(res, 'Failed to fetch role', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const updateRole = async (req: Request, res: Response) => {
  const { id } = req.query;
  const { name, permissions } = req.body;

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id.toString())) {
      return APIResponse.error(res, 'Role ID is required', null, StatusCodes.BAD_REQUEST);
    }

    const role = await Role.findById(id);
    if (!role) {
      return APIResponse.error(res, 'Role not found', null, StatusCodes.NOT_FOUND);
    }

    const protectedRoles = [UserRoles.ADMIN, UserRoles.SUB_ADMIN];
    if (protectedRoles.includes(role?.name as UserRoles)) {
      return APIResponse.error(res, `The role '${role?.name}' cannot be updated.`, null, StatusCodes.BAD_REQUEST);
    }

    if (!name || typeof name !== 'string') {
      return APIResponse.error(res, 'Role name is required', null, StatusCodes.BAD_REQUEST);
    }
    if (name !== role.name) {
      const existingPermission = await Role.findOne({ name });
      if (existingPermission) {
        return APIResponse.error(res, `Role '${name}' already exists.`, null, StatusCodes.BAD_REQUEST);
      }
    }

    // validate permissions exist in db
    for (const permissionId of permissions) {
      if (!isValidObjectId(permissionId)) {
        return APIResponse.error(res, 'Invalid permission ID', null, StatusCodes.BAD_REQUEST);
      }
      const permission = await Permission.findById(permissionId);
      if (!permission) {
        return APIResponse.error(res, 'Permission not found', { permissionId }, StatusCodes.NOT_FOUND);
      }
    }

    role.name = name;
    role.permissions = permissions;
    await role.save();

    return APIResponse.success(res, 'Role updated successfully', { role });
  } catch (error) {
    console.error('Error updating role:', error);
    return APIResponse.error(res, 'Failed to update role', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id, name } = req.query;
    if (!id && !name) {
      return APIResponse.error(res, 'Role ID or name is required', null, StatusCodes.BAD_REQUEST);
    }
    let role;
    if (id) {
      role = await Role.findById(id);
    } else if (name) {
      role = await Role.findOne({ name });
    }
    const protectedRoles = [UserRoles.ADMIN, UserRoles.SUB_ADMIN];
    if (protectedRoles.includes(role?.name as UserRoles)) {
      return APIResponse.error(res, `The role '${role?.name}' cannot be deleted.`, null, StatusCodes.BAD_REQUEST);
    }
    const userCount = await Role.countDocuments({ role: role?.name });

    if (userCount > 0) {
      return APIResponse.error(
        res,
        `The role '${role?.name}' is assigned to ${userCount} user(s) and cannot be deleted.`,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
    if (!role) {
      return APIResponse.error(res, 'Role not found', null, StatusCodes.NOT_FOUND);
    }
    await role.deleteOne();

    return APIResponse.success(res, 'Role deleted successfully', { role });
  } catch (error) {
    console.error('Error deleting role:', error);
    return APIResponse.error(res, 'Failed to delete role', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const AssignPermissiontoRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const { name, description } = req.body;

    const existingPermission = await Permission.findOne({ name });

    if (existingPermission) {
      return APIResponse.error(res, `Permission '${name}' already exists.`, null, StatusCodes.BAD_REQUEST);
    }
    const permission = new Permission({ name, description });
    await permission.save();

    const role = await Role.findById(id);
    if (!role) {
      return APIResponse.error(res, 'Role not found', null, StatusCodes.NOT_FOUND);
    }
    if (!role.permissions.includes(permission._id as mongoose.Types.ObjectId)) {
      role.permissions.push(permission._id as mongoose.Types.ObjectId);
      await role.save();
    }
    return APIResponse.success(res, 'Permission assigned to role successfully', { permission });
  } catch (error) {
    console.error('Error assigning permission to role:', error);
    return APIResponse.error(res, 'Failed to assign permission to role', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id, email, phone, username, roleId } = req.query;

    if (!email && !phone && !username) {
      return APIResponse.error(res, 'Email, phone or username must be provided.', null, StatusCodes.BAD_REQUEST);
    }

    const user = email
      ? await User.findOne({ email })
      : phone
        ? await User.findOne({ phone })
        : id
          ? await User.findById(id)
          : username
            ? await User.findOne({ username })
            : null;

    if (!user) {
      return APIResponse.error(res, 'User not found.', null, StatusCodes.NOT_FOUND);
    }

    if (!roleId) {
      return APIResponse.error(res, 'Role ID is required.', null, StatusCodes.BAD_REQUEST);
    }

    if (!isValidObjectId(roleId)) {
      return APIResponse.error(res, 'Invalid Role ID.', null, StatusCodes.BAD_REQUEST);
    }

    const existingRole = await Role.findById(roleId);
    if (!existingRole) {
      return APIResponse.error(res, 'Role not found.', null, StatusCodes.NOT_FOUND);
    }
    user.role = existingRole._id as mongoose.Types.ObjectId;
    await user.save();
    return APIResponse.success(res, 'User role updated successfully', { user });
  } catch (error) {
    console.error('Error updating user role:', error);
    return APIResponse.error(res, 'Failed to update user role', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
