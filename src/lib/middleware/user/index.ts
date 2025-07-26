import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { MODELS } from '@/common/constants/common';
import {
  AdminPermissions,
  CommonPermissions,
  CustomerPermissions,
  SuperAdminPermissions,
} from '@/common/constants/enums';
import { User } from '@/common/models/user';
import { IRoles, IUser } from '@/common/types/users';
import { env } from '@/common/utils/envConfig';
import { APIResponse } from '@/common/utils/response';

const { JWT_SECRET_KEY } = env;

// Authenticate user by token
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return APIResponse.error(res, 'No token provided', null, StatusCodes.UNAUTHORIZED);
  }

  jwt.verify(token, JWT_SECRET_KEY as string, (err, user) => {
    if (err) {
      return APIResponse.error(res, 'Invalid token', null, StatusCodes.UNAUTHORIZED);
    }

    req.user = user as IUser;
    next();
  });
};

// Check user role
export const hasPermission = (
  permission: CommonPermissions | AdminPermissions | SuperAdminPermissions | CustomerPermissions
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req?.user?.id).populate({
      path: 'role',
      populate: { path: 'permissions', model: MODELS.PERMISSIONS, select: '-__v' },
    });

    if (!user) {
      // return res.status(403).json({ message: 'User not found' });
      return APIResponse.error(res, 'User not found', null, StatusCodes.UNAUTHORIZED);
    }

    if (user.email && !user.emailVerified) {
      return APIResponse.error(res, 'Email not verified', null, StatusCodes.FORBIDDEN);
    }

    if (user.phone && !user.phoneVerified) {
      return APIResponse.error(res, 'Phone not verified', null, StatusCodes.FORBIDDEN);
    }

    const role = user.role as any as IRoles;
    if (!role) {
      // return res.status(StatusCodes.FORBIDDEN).json({ message: 'Role not found' });
      return APIResponse.error(res, 'Role not found', null, StatusCodes.FORBIDDEN);
    }

    const hasPermission = role.permissions.some((perm: any) => perm.name === permission);
    if (!hasPermission) {
      return APIResponse.error(res, 'Access Denied', null, StatusCodes.FORBIDDEN);
    }

    next();
  };
};
