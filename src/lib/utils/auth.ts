import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { IUser } from '../types/users';

import { User } from '../models/user';
import { env } from '../../config/envConfig';

const { JWT_SECRET_KEY, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS } = env;

export const generateToken = (user: any) => {
  const payload: Partial<IUser> = {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
  };

  const token = jwt.sign(payload, JWT_SECRET_KEY as string, { expiresIn: JWT_EXPIRES_IN as string } as jwt.SignOptions);

  return token;
};

export const verifyToken = (token: string) => {
  const decoded = jwt.verify(token, JWT_SECRET_KEY);

  return decoded;
};

export const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  return hashedPassword;
};

export const isValidPassword = async (password: string, hashedPassword: string) => {
  const validPassword = await bcrypt.compare(password, hashedPassword);

  return validPassword;
};

export const hashOTP = async (otp: string) => {
  const hashedOTP = await bcrypt.hash(otp, BCRYPT_SALT_ROUNDS);

  return hashedOTP;
};

export const isValidOTP = async (otp: string, hashedOTP: string) => {
  const validOTP = await bcrypt.compare(otp, hashedOTP);

  return validOTP;
};

interface IGetUserByIdOrEmailOrUsernameOrPhone {
  id?: string;
  email?: string;
  username?: string;
  phone?: string;
}

export const getUserByIdOrEmailOrUsernameOrPhone = async (params: IGetUserByIdOrEmailOrUsernameOrPhone) => {
  const { id, email, username, phone } = params;
  const user = await User.findOne({
    $or: [{ email }, { username }, { phone, phoneVerified: true }, { _id: id }],
  }).select('-password -__v ');

  return user;
};
