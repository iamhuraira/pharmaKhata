import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import {
  AdminPermissions,
  CommonPermissions,
  CustomerPermissions,
  SuperAdminPermissions,
} from '@/common/constants/enums';
import { Permission } from '@/common/models/permissions';
import { Role } from '@/common/models/roles';
import { APIResponse } from '@/common/utils/response';

export const createPermission = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return APIResponse.error(res, 'Permission details are required', null, StatusCodes.BAD_REQUEST);
    }

    const permission = new Permission(req.body);
    await permission.save();
    return APIResponse.success(res, 'Permission created successfully', { permission }, StatusCodes.CREATED);
  } catch (error) {
    console.error('Error creating permission:', error);
    return APIResponse.error(res, 'Error creating permission', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const getAllPermission = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (page <= 0 || limit <= 0) {
      return APIResponse.error(res, 'Invalid page or limit value', null, StatusCodes.BAD_REQUEST);
    }

    const totalCount = await Permission.countDocuments();
    let permissions;

    if (!req.query.page && !req.query.limit) {
      permissions = await Permission.find();
    } else {
      permissions = await Permission.find().skip(skip).limit(limit);
    }

    if (permissions.length === 0) {
      return APIResponse.error(res, 'No permissions found', null, StatusCodes.NOT_FOUND);
    }

    //   const totalPages = Math.ceil(totalCount / limit);

    return APIResponse.success(
      res,
      'Successfully retrieved permissions',
      {
        totalItems: totalCount,
        permissions,
      },
      StatusCodes.OK
    );
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return APIResponse.error(res, 'Failed to fetch permissions', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const getSinglePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    if (!id) {
      return APIResponse.error(res, 'Permission ID is required', null, StatusCodes.BAD_REQUEST);
    }

    const permission = await Permission.findById(id);
    if (!permission) {
      return APIResponse.error(res, 'Permission not found', null, StatusCodes.NOT_FOUND);
    }
    return APIResponse.success(res, 'Permission fetched successfully', { permission });
  } catch (error) {
    console.error('Error fetching permission by ID:', error);
    return APIResponse.error(res, 'Failed to fetch permission', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const updatePermission = async (req: Request, res: Response) => {
  const { id } = req.query;
  const { name, description } = req.body;

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id.toString())) {
      return APIResponse.error(
        res,
        'Permission ID is required and must be a valid ObjectId',
        null,
        StatusCodes.BAD_REQUEST
      );
    }

    const permission = await Permission.findById(id);
    if (!permission) {
      return APIResponse.error(res, 'Permission not found', null, StatusCodes.NOT_FOUND);
    }

    const seedPermissions = new Set([
      ...Object.values(CommonPermissions),
      ...Object.values(AdminPermissions),
      ...Object.values(CustomerPermissions),
      ...Object.values(SuperAdminPermissions),
    ]);

    if (seedPermissions.has(permission.name)) {
      return APIResponse.error(res, 'Cannot delete seeded permissions', null, StatusCodes.BAD_REQUEST);
    }

    if (!name || typeof name !== 'string') {
      return APIResponse.error(res, 'Permission name is required', null, StatusCodes.BAD_REQUEST);
    }
    if (name !== permission.name) {
      const existingPermission = await Permission.findOne({ name });
      if (existingPermission) {
        return APIResponse.error(res, 'Permission name already exists', null, StatusCodes.BAD_REQUEST);
      }
    }
    permission.name = name;
    permission.description = description;
    await permission.save();

    return APIResponse.success(res, 'Permission updated successfully', { permission });
  } catch (error) {
    console.error('Error updating permission:', error);
    return APIResponse.error(res, 'Failed to update permission', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const deletePermission = async (req: Request, res: Response) => {
  try {
    const { id, name } = req.query;
    if (!id && !name) {
      return APIResponse.error(res, 'Permission ID or name is required', null, StatusCodes.BAD_REQUEST);
    }
    let permission;
    if (id) {
      permission = await Permission.findById(id);
    } else if (name) {
      permission = await Permission.findOne({ name });
    }
    if (!permission) {
      return APIResponse.error(res, 'Permission not found', null, StatusCodes.NOT_FOUND);
    }
    const seedPermissions = new Set([
      ...Object.values(CommonPermissions),
      ...Object.values(AdminPermissions),
      ...Object.values(CustomerPermissions),
      ...Object.values(SuperAdminPermissions),
    ]);

    if (seedPermissions.has(permission.name)) {
      return APIResponse.error(res, 'Cannot delete seeded permissions', null, StatusCodes.BAD_REQUEST);
    }
    const roleCount = await Role.countDocuments({ permissions: permission._id });

    if (roleCount > 1) {
      return APIResponse.error(res, 'Permission is assigned to one or more roles', null, StatusCodes.BAD_REQUEST);
    }
    await permission.deleteOne();

    return APIResponse.success(res, 'Permission deleted successfully');
  } catch (error) {
    console.error('Error deleting permission:', error);
    return APIResponse.error(res, 'Failed to delete permission', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
