import console from 'node:console';

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { UserRoles, UserStatus } from '@/common/constants/enums';
import { Permission } from '@/common/models/permissions';
import { User } from '@/common/models/user';
import { hashPassword, isValidOTP, isValidPassword } from '@/common/utils/auth';
import { generateOTP } from '@/common/utils/generateOTP';
import { APIResponse } from '@/common/utils/response';
import { deleteFileFromCloudinary, uploadFileToCloudinary } from '@/common/utils/uploadFile';

const USER_RESPONSE_VALUES = 'firstName profilePicture lastName TFAEnabled username phone email';

// get user
export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req?.user?.id) {
      return APIResponse.error(res, 'Not authorized', null, StatusCodes.UNAUTHORIZED);
    }

    const id = req.user.id;

    const user = await User.findById(id)
      .populate({
        path: 'role',
        select: '-__v',
        populate: { path: 'permissions', model: Permission, select: '-__v' },
      })
      .select(USER_RESPONSE_VALUES);

    if (!user) {
      return APIResponse.error(res, 'Not authorized', null, StatusCodes.UNAUTHORIZED);
    }

    if (user.status === UserStatus.DELETED) {
      return APIResponse.error(res, 'Not authorized', null, StatusCodes.UNAUTHORIZED);
    }

    if (user.status === UserStatus.BLOCKED) {
      return APIResponse.error(res, 'Not authorized', null, StatusCodes.FORBIDDEN);
    }

    return APIResponse.success(res, 'User fetched successfully', { user });
  } catch (err) {
    return APIResponse.error(res, 'Internal server error', err, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// update user
export const updateMe = async (req: Request, res: Response) => {
  try {
    if (!req?.user?.id) {
      return APIResponse.error(res, 'Not authorized', null, StatusCodes.UNAUTHORIZED);
    }

    const id = req.user.id;

    const user = await User.findById(id);
    if (!user || user.status === UserStatus.DELETED) {
      return APIResponse.error(res, 'Not authorized', null, StatusCodes.UNAUTHORIZED);
    }

    if (user.status === UserStatus.BLOCKED) {
      return APIResponse.error(res, 'Not authorized', null, StatusCodes.FORBIDDEN);
    }

    if (req.body.username && !req.body.phone) {
      const alreadyExists = await User.findOne({ username: req.body.username });
      if (alreadyExists && alreadyExists._id.toString() !== id) {
        return APIResponse.error(res, 'Username already exists', null, StatusCodes.BAD_REQUEST);
      }
    } else if (req.body.phone && !req.body.username) {
      const alreadyExists = await User.findOne({ phone: req.body.phone });
      if (alreadyExists && alreadyExists._id.toString() !== id) {
        return APIResponse.error(res, 'Phone number already exists', null, StatusCodes.BAD_REQUEST);
      }
    } else if (req.body.phone && req.body.username) {
      const alreadyExists = await User.findOne({
        $or: [{ email: req.body.email }, { username: req.body.username }, { phone: req?.body?.phone }],
      });
      if (alreadyExists && alreadyExists._id.toString() !== id) {
        return APIResponse.error(res, 'User already exists', null, StatusCodes.BAD_REQUEST);
      }
    }

    const updatedProperties = {};
    Object.keys(req.body).forEach((key) => {
      (updatedProperties as any)[key] = req.body[key];
    });

    const updateUser = await User.findByIdAndUpdate(id, updatedProperties, { new: true }).select(USER_RESPONSE_VALUES);

    return APIResponse.success(res, 'User updated successfully', { user: updateUser });
  } catch (e) {
    return APIResponse.error(res, 'Internal server error', e, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// delete user
export const deleteMe = async (req: Request, res: Response) => {
  try {
    if (!req?.user?.id) {
      return APIResponse.error(res, 'Not authorized', null, StatusCodes.UNAUTHORIZED);
    }
    const id = req.user.id;

    const user = await User.findByIdAndUpdate(id, { status: 'deleted' }, { new: true }).select(USER_RESPONSE_VALUES);
    if (!user) {
      return APIResponse.error(res, 'Not authorized', null, StatusCodes.UNAUTHORIZED);
    }
    if (!(user?.email === req.body.email || user?.username === req.body.username || user?._id === req.body.userId)) {
      return APIResponse.error(res, 'Not authorized', null, StatusCodes.UNAUTHORIZED);
    }

    return APIResponse.success(res, 'User deleted successfully', { user });
  } catch (e) {
    return APIResponse.error(res, 'Internal server error', e, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// update password request

export const updatePasswordRequest = async (req: Request, res: Response) => {
  try {
    const id = req?.user?.id;

    const user = await User.findById(id);

    if (!user) {
      return APIResponse.error(res, 'Not authorized', null, StatusCodes.UNAUTHORIZED);
    }

    if (user.status === UserStatus.DELETED) {
      return APIResponse.error(res, 'Not authorized', null, StatusCodes.UNAUTHORIZED);
    }

    if (user.status === UserStatus.BLOCKED) {
      return APIResponse.error(res, 'This account is blocked', null, StatusCodes.FORBIDDEN);
    }

    if (((user.role as any).name as string) === UserRoles.ADMIN) {
      return APIResponse.error(res, 'Admins cannot update password', null, StatusCodes.FORBIDDEN);
    }

    if (user.passwordUpdateRequested) {
      return APIResponse.error(res, 'Password update already requested', null, StatusCodes.BAD_REQUEST);
    }

    user.passwordUpdateRequested = true;

    await user.save();

    return APIResponse.success(res, 'Password update request sent successfully');
  } catch (err) {
    return APIResponse.error(res, 'Internal server error', err, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// update Password

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const id = req?.user?.id;
    const user = await User.findById(id);
    if (!user) {
      return APIResponse.error(res, 'Not authorized', null, StatusCodes.UNAUTHORIZED);
    }
    if (user.status === UserStatus.DELETED) {
      return APIResponse.error(res, 'Not authorized', null, StatusCodes.UNAUTHORIZED);
    }

    if (user.status === UserStatus.BLOCKED) {
      return APIResponse.error(res, 'User is blocked', null, StatusCodes.FORBIDDEN);
    }

    const hashedPassword = await hashPassword(req.body.password);
    user.passwordUpdateRequested = false;
    user.password = hashedPassword;

    await user.save();
    return APIResponse.success(res, 'Password updated successfully');
  } catch (err) {
    console.log(err);
    return APIResponse.error(res, 'Internal server error', err, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// upload profile picture
export const uploadProfilePic = async (req: Request, res: Response) => {
  const id = req?.user?.id;
  const { file } = req;

  if (!file) {
    return APIResponse.error(res, 'Please upload a file', null, StatusCodes.BAD_REQUEST);
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return APIResponse.error(res, 'User not found', null, StatusCodes.NOT_FOUND);
    }

    if (user.status === UserStatus.DELETED) {
      return APIResponse.error(res, 'User not found', null, StatusCodes.UNAUTHORIZED);
    }

    if (user.status === UserStatus.BLOCKED) {
      return APIResponse.error(res, 'User is blocked', null, StatusCodes.FORBIDDEN);
    }

    const { url } = await uploadFileToCloudinary(file.path);

    const oldProfilePicture = user.profilePicture;
    user.profilePicture = url;
    await user.save();

    if (oldProfilePicture) {
      await deleteFileFromCloudinary(oldProfilePicture);
    }

    return APIResponse.success(res, 'Profile picture uploaded successfully', { profilePicture: url });
  } catch (error) {
    console.log(error);
    return APIResponse.error(res, 'Internal server error', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// unable two factor authentication
export const enableTwoFactorAuthentication = async (req: Request, res: Response) => {
  const id = req?.user?.id;
  const user = await User.findById(id);

  try {
    if (!user) {
      return APIResponse.error(res, 'User not found', null, StatusCodes.NOT_FOUND);
    }
    if (user.status === UserStatus.DELETED) {
      return APIResponse.error(res, 'Account not found', null, StatusCodes.UNAUTHORIZED);
    }

    if (user.status === UserStatus.BLOCKED) {
      return APIResponse.error(res, 'User is blocked', null, StatusCodes.FORBIDDEN);
    }

    user.TFAEnabled = true;

    await user.save();
    return APIResponse.success(res, 'Two-factor authentication enabled successfully');
  } catch (error) {
    console.error('Error while enabling TFA', error);
    return APIResponse.error(res, 'Error enabling TFA', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const disableTwoFactorAuthentication = async (req: Request, res: Response) => {
  const id = req?.user?.id;
  const user = await User.findById(id);

  try {
    if (!user) {
      return APIResponse.error(res, 'User not found', null, StatusCodes.NOT_FOUND);
    }
    if (user.status === UserStatus.DELETED) {
      return APIResponse.error(res, 'Account not found', null, StatusCodes.UNAUTHORIZED);
    }

    if (user.status === UserStatus.BLOCKED) {
      return APIResponse.error(res, 'User is blocked', null, StatusCodes.FORBIDDEN);
    }

    user.TFAOTP = '';
    user.TFAEnabled = false;

    await user.save();
    return APIResponse.success(res, 'Two-factor authentication disabled successfully');
  } catch (error) {
    console.error('Error while diabling TFA:', error);
    return APIResponse.error(res, 'Error disabling TFA', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// generate email verification OTP controller
export const requestEmailVerificationOtp = async (req: Request, res: Response) => {
  const { id } = req.user;
  const user = await User.findById(id);

  try {
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
    console.log({ EmailOTP: otp });

    // TODO: Send the OTP to the user's email

    const hashedOTP = await hashPassword(otp);
    user.emailVerificationOTP = hashedOTP;

    await user.save();
    return APIResponse.success(res, 'OTP sent successfully');
  } catch (error) {
    console.error('Error requesting OTP:', error);
    return APIResponse.error(res, 'Internal server error', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// generate phone verification OTP controller
export const requestPhoneVerificationOTP = async (req: Request, res: Response) => {
  const { id } = req.user;

  if (!id) {
    return APIResponse.error(res, 'Not Authorized', null, StatusCodes.UNAUTHORIZED);
  }

  try {
    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return APIResponse.error(res, 'User not found', null, StatusCodes.NOT_FOUND);
    }

    if (!user.phone) {
      return APIResponse.error(res, 'Phone number not found', null, StatusCodes.NOT_FOUND);
    }

    if (user.phoneVerified) {
      return APIResponse.error(res, 'Phone number already verified', null, StatusCodes.BAD_REQUEST);
    }

    const phoneOfOtherUser = await User.findOne({ phone: user.phone, _id: { $ne: user._id }, phoneVerified: true });

    if (phoneOfOtherUser) {
      return APIResponse.error(res, 'Phone number already exists', null, StatusCodes.BAD_REQUEST);
    }

    // Generate a 5 digit OTP
    const otp = generateOTP();
    console.log({ phoneOTP: otp });

    //TODO: Send the OTP to the user's phone number

    const hashedOTP = await hashPassword(otp);
    user.phoneVerificationOTP = hashedOTP;

    await user.save();
    return APIResponse.success(res, 'OTP sent successfully');
  } catch (error: any) {
    console.error(error.message);
    return APIResponse.error(res, 'Internal server error', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// verify email by OTP Controller
export const verifyEmailByOTP = async (req: Request, res: Response) => {
  const { otp } = req.query;
  const { id } = req.user;

  if (!otp) {
    return APIResponse.error(res, 'OTP is required', null, StatusCodes.BAD_REQUEST);
  }

  if (!id) {
    return APIResponse.error(res, 'Not Authorized', null, StatusCodes.UNAUTHORIZED);
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return APIResponse.error(res, 'User not found', null, StatusCodes.NOT_FOUND);
    }

    const validOTP = await isValidOTP(otp as string, user.emailVerificationOTP as string);

    if (validOTP) {
      user.emailVerified = true;
      user.emailVerificationOTP = '';
      await user.save();

      return APIResponse.success(res, 'Email verified successfully');
    } else {
      return APIResponse.error(res, 'Invalid OTP', null, StatusCodes.BAD_REQUEST);
    }
  } catch (error: any) {
    return APIResponse.error(res, 'Internal server error', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// verify phone by OTP Controller
export const verifyPhoneByOTP = async (req: Request, res: Response) => {
  const { otp } = req.query;
  const { id } = req.user;

  if (!otp) {
    return APIResponse.error(res, 'OTP is required', null, StatusCodes.BAD_REQUEST);
  }

  if (!id) {
    return APIResponse.error(res, 'Not Authorized', null, StatusCodes.UNAUTHORIZED);
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return APIResponse.error(res, 'User not found', null, StatusCodes.NOT_FOUND);
    }

    const validOTP = await isValidOTP(otp as string, user.phoneVerificationOTP as string);
    if (validOTP) {
      user.phoneVerified = true;
      user.phoneVerificationOTP = '';
      await user.save();

      return APIResponse.success(res, 'Phone verified successfully');
    } else {
      return APIResponse.error(res, 'Invalid OTP', null, StatusCodes.BAD_REQUEST);
    }
  } catch (error: any) {
    console.error(error.message);
    return APIResponse.error(res, 'Internal server error', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Change Password With Current Password

export const changePasswordUsingCurrentPassword = async (req: Request, res: Response) => {
  try {
    const id = req?.user?.id;
    const user = await User.findById(id);
    if (!user) {
      return APIResponse.error(res, 'Not authorized', null, StatusCodes.UNAUTHORIZED);
    }
    if (user.status === UserStatus.DELETED) {
      return APIResponse.error(res, 'Not authorized', null, StatusCodes.UNAUTHORIZED);
    }

    if (user.status === UserStatus.BLOCKED) {
      return APIResponse.error(res, 'User is blocked', null, StatusCodes.FORBIDDEN);
    }

    const validPassword = await isValidPassword(req.body.currentPassword, user.password);

    if (!validPassword) {
      return APIResponse.error(
        res,
        "Oops, the password you entered doesn't match our records",
        null,
        StatusCodes.BAD_REQUEST
      );
    }

    user.password = await hashPassword(req.body.password);

    await user.save();
    return APIResponse.success(res, 'Password updated successfully');
  } catch (err) {
    console.log(err);
    return APIResponse.error(res, 'Internal server error', err, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
