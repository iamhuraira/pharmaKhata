import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { MODELS } from '@/common/constants/common';
import { UserRoles, UserStatus } from '@/common/constants/enums';
import { Role } from '@/common/models/roles';
import { User } from '@/common/models/user';
import { IRoles } from '@/common/types/users';
import { generateToken, hashOTP, hashPassword, isValidOTP, isValidPassword } from '@/common/utils/auth';
import { generateOTP } from '@/common/utils/generateOTP';
import { APIResponse } from '@/common/utils/response';
import { logger } from '@/server';

// Register user controller
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (req.body.password !== req.body.confirmPassword) {
      return APIResponse.error(res, 'Password and Confirm Password do not match', null, StatusCodes.BAD_REQUEST);
    }

    const existingUser = await User.findOne({ phone });

    if (existingUser && existingUser.status !== UserStatus.DELETED) {
      return APIResponse.error(res, 'User already exists', null, StatusCodes.CONFLICT);
    }

    if (req.body.phone && existingUser && existingUser.phone === req.body.phone && existingUser.phoneVerified) {
      return APIResponse.error(res, 'Phone number already exists', null, StatusCodes.CONFLICT);
    }

    const hashedPassword = await hashPassword(req.body.password);

    const userRole = await Role.findOne({ name: UserRoles.USER });

    if (!userRole) {
      return APIResponse.error(res, 'User role not found', null, StatusCodes.NOT_FOUND);
    }

    delete req.body.confirmPassword;
    delete req.body.role;

    // const otp = generateOTP(); // generate OTP
    // console.log({ emailOTPOnRegister: otp });
    // const hashedOTP = await hashOTP(otp);

    let user = null;

    // Send email to user with OTP if user is not created by the admin (Hint: there will be no user in the req.user object if the user is not created by the admin)
    if (!existingUser) {
      const newUser = new User({ ...req.body, phone: req.body.phone, role: userRole._id });

      newUser.password = hashedPassword;

      // newUser.emailVerificationOTP = hashedOTP;

      user = await newUser.save();
    }

    // TODO: Send confirmation email to the user that admin has creaed an account on there email and send the credentials to login to the user
    else {
      Object.keys(req.body).forEach((key) => {
        (existingUser as any)[key] = req.body[key];
      });
      existingUser.password = hashedPassword;
      existingUser.status = UserStatus.ACTIVE;

      // existingUser.emailVerificationOTP = hashedOTP;

      user = await existingUser.save();
    }

    if (!user) {
      return APIResponse.error(res, 'Error while registering', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }

    const token = generateToken({ ...user.toObject(), role: 'user' });

    if (!token) {
      return APIResponse.error(
        res,
        'You have registered successfully, but unfortunately something went wrong while generating token, so please login with your credentials to get the token',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return APIResponse.success(res, 'User registered successfully', { token, phone: user.phone });
  } catch (error) {
    console.log({ error });

    logger.error('Error while registering 456', JSON.stringify(error));
    return APIResponse.error(res, 'Error while registering', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Login user controller
export const loginUser = async (req: Request, res: Response) => {
  try {
    // const { email, username, phone, fromAdminPanel } = req.body;
    console.log('====================Login==============');
    const { phone } = req.body;
    // if (!email && !username && !phone) {
    if (!phone) {
      return APIResponse.error(res, 'phone is required', null, StatusCodes.BAD_REQUEST);
    }

    const user = await User.findOne({
      // ...(email && { email }),
      // ...(username && { username }),
      ...(phone && { phone }),
    }).populate({
      path: 'role',
      select: '-__v',
    });

    console.log({ user });

    if (!user) {
      return APIResponse.error(res, 'Invalid Credentials', null, StatusCodes.NOT_FOUND);
    }

    if (user.status === UserStatus.DELETED) {
      return APIResponse.error(res, 'Invalid Credentials', null, StatusCodes.NOT_FOUND);
    }

    const userRole = (user.role as IRoles).name;

    // only allow admin and subadmin to login from admin panel
    // if (fromAdminPanel && userRole === UserRoles.USER) {
    //   return APIResponse.error(res, 'Invalid Credentials', null, StatusCodes.NOT_FOUND);
    // }

    const validPassword = await isValidPassword(req.body.password, user.password);

    if (!validPassword) {
      return APIResponse.error(res, 'Invalid Credentials', null, StatusCodes.BAD_REQUEST);
    }

    if (user.status === UserStatus.BLOCKED) {
      return APIResponse.error(res, 'User is blocked', null, StatusCodes.FORBIDDEN);
    }

    const token = generateToken(user);
    user.accessToken = token;

    // if (user.TFAEnabled) {
    //   const otp = generateOTP();
    //   user.TFAOTP = await hashOTP(otp);
    //
    //   console.log({ TFAOTP: otp });
    //   //TODO: send the OTP to the user's email
    //   await user.save();
    //
    //   return APIResponse.success(res, 'Credentials verified successfully', {
    //     token: null,
    //     // TFAEnabled: true,
    //     role: userRole,
    //     // email,
    //     // emailVerified: user.emailVerified,
    //   });
    // }

    await user.save();

    return APIResponse.success(res, 'Logged in successfully', {
      token,
      // TFAEnabled: false,
      role: userRole,
      phone,
      // email,
      // emailVerified: user.emailVerified,
    });
  } catch (error) {
    console.log({ error });
    return APIResponse.error(res, 'Internal server error', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// verify username controller
export const validateUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.query;
    const user = await User.findOne({ username });

    if (!user) {
      return APIResponse.error(res, 'Username not found', null, StatusCodes.NOT_FOUND);
    }

    if (user.status === UserStatus.DELETED) {
      return APIResponse.error(res, 'User not found', null, StatusCodes.NOT_FOUND);
    }

    if (user) {
      return APIResponse.success(res, 'Username found', { exists: true });
    }
  } catch (error) {
    return APIResponse.error(res, 'Internal server error', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// request forgot password OTP controller
export const requestForgotPasswordOTP = async (req: Request, res: Response) => {
  try {
    const { email, username, phone } = req.query;
    if (!email && !username && !phone) {
      return APIResponse.error(res, 'Email, username, or phone is required', null, StatusCodes.BAD_REQUEST);
    }
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (username) {
      user = await User.findOne({ username });
    } else if (phone) {
      user = await User.findOne({ phone });
    }
    if (!user) {
      return APIResponse.error(res, 'User not found', null, StatusCodes.NOT_FOUND);
    }

    if (user.status === UserStatus.DELETED) {
      return APIResponse.error(res, 'User not found', null, StatusCodes.NOT_FOUND);
    }

    if (user.status === UserStatus.BLOCKED) {
      return APIResponse.error(res, 'User is blocked', null, StatusCodes.FORBIDDEN);
    }

    const otp = generateOTP();
    console.log({ forgotPasswordOTP: otp });
    user.forgotPasswordOTP = await hashOTP(otp);

    await user.save();

    return APIResponse.success(res, 'OTP sent successfully');
  } catch (error: any) {
    return APIResponse.error(res, 'Internal server error', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// verify forgot password OTP controller
export const verifyforgotPasswordOTP = async (req: Request, res: Response) => {
  const { otp, username, email, phone } = req.query;

  try {
    // Find user by username, email, or phone
    const user = await User.findOne({
      ...(email && { email }),
      ...(username && { username }),
      ...(phone && { phone }),
    }).populate({
      path: 'role',
      select: '-__v',
      populate: {
        path: 'permissions',
        model: MODELS.PERMISSIONS,
        select: '-__v',
      },
    });

    if (!user) {
      return APIResponse.error(res, 'Not Found', null, StatusCodes.NOT_FOUND);
    }
    const validOTP = await isValidOTP(otp as string, user.forgotPasswordOTP as string);
    // Check if the OTP matches the forgotPasswordOTP stored in the user document
    if (!validOTP) {
      return APIResponse.error(res, 'OTP does not match', null, StatusCodes.BAD_REQUEST);
    }

    if (validOTP) {
      const token = generateToken(user);
      user.forgotPasswordOTP = '';
      await user.save();
      return APIResponse.success(res, 'OTP verified successfully', { token });
    }
  } catch (error: any) {
    return APIResponse.error(res, 'Internal server error', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const verifyTwoFactorAuthentication = async (req: Request, res: Response) => {
  const { username, email, phone, otp } = req.query;
  try {
    // Find user by username, email, or phone
    const user = await User.findOne({
      ...(email && { email }),
      ...(username && { username }),
      ...(phone && { phone }),
    }).populate({
      path: 'role',
      select: '-__v -permissions',
    });

    if (!user) {
      return APIResponse.error(res, 'Invalid username, email or phone', null, StatusCodes.NOT_FOUND);
    }

    if (!user.TFAOTP) {
      return APIResponse.error(res, 'Two Factor Authentication not enabled', null, StatusCodes.BAD_REQUEST);
    }

    const validOTP = await isValidOTP(otp as string, user.TFAOTP);

    if (!validOTP) {
      return APIResponse.error(res, 'OTP does not match', null, StatusCodes.BAD_REQUEST);
    }

    if (validOTP) {
      user.TFAOTP = '';
      const token = user.accessToken;
      await user.save();

      return APIResponse.success(res, 'Two Factor Authentication verified successfully', {
        token,
        role: user.role,
        TFAEnabled: user.TFAEnabled,
      });
    }
  } catch (error: any) {
    return APIResponse.error(res, 'Internal server error', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const resendTFAOTP = async (req: Request, res: Response) => {
  const { username, email, phone } = req.query;
  try {
    const user = await User.findOne({
      ...(email && { email }),
      ...(username && { username }),
      ...(phone && { phone }),
    });

    if (!user) {
      return APIResponse.error(res, 'User not found', null, StatusCodes.NOT_FOUND);
    }

    if (user.status === UserStatus.DELETED) {
      return APIResponse.error(res, 'User not found', null, StatusCodes.NOT_FOUND);
    }

    if (user.status === UserStatus.BLOCKED) {
      return APIResponse.error(res, 'User is blocked', null, StatusCodes.FORBIDDEN);
    }

    if (!user.TFAEnabled) {
      return APIResponse.error(res, 'Two Factor Authentication not enabled', null, StatusCodes.BAD_REQUEST);
    }

    if (!user.TFAOTP) {
      return APIResponse.error(res, 'First verify your credentials', null, StatusCodes.UNAUTHORIZED);
    }

    if (!user.accessToken) {
      return APIResponse.error(res, 'First login to get the token', null, StatusCodes.UNAUTHORIZED);
    }

    const otp = generateOTP();

    console.log({ TFAOTP: otp });

    // TODO: send the OTP to the user's email

    user.TFAOTP = await hashOTP(otp);

    await user.save();

    return APIResponse.success(res, 'OTP sent successfully');
  } catch (error: any) {
    return APIResponse.error(res, 'Internal server error', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
