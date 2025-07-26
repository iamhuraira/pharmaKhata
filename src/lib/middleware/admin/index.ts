import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { UserRoles } from '@/common/constants/enums';
import { IRoles } from '@/common/types/users';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (user && (user.role as IRoles).name === UserRoles.ADMIN) {
    next();
  } else {
    res.status(StatusCodes.FORBIDDEN).send({ message: 'Access denied. Admins only.' });
  }
};
