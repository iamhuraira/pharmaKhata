import { Response } from 'express';

export const APIResponse = {
  success: (res: Response, message: string, data?: any, statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      ...data,
    });
  },

  error: (res: Response, message: string, error?: any, statusCode = 400) => {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  },
};
