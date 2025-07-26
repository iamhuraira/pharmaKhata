import mongoose from 'mongoose';

import { MODELS } from '../constants/common';
import { UserStatus } from '../constants/enums';
import { IUserDoc } from '../types/users';

const Schema = mongoose.Schema;

const AddressSchema = new Schema({
  street: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },

  state: {
    type: String,
    required: true,
  },

  country: {
    type: String,
    required: true,
  },
});

const userSchema = new Schema(
  {
    firstName: {
      type: String,
    },

    lastName: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },

    passwordUpdateRequested: {
      type: Boolean,
      default: false,
    },

    role: {
      type: Schema.Types.ObjectId,
      ref: MODELS.ROLES,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(UserStatus),
      required: true,
      default: UserStatus.ACTIVE,
    },

    phone: {
      type: String,
    },

    currentAddress: {
      type: AddressSchema,
      required: false,
    },

    phoneVerified: {
      type: Boolean,
      required: true,
      default: false,
    },

    profilePicture: {
      type: String,
      required: false,
    },

    phoneVerificationOTP: {
      type: String,
      nullable: true,
      default: null,
    },

    forgotPasswordOTP: {
      type: String,
      default: null,
    },

    accessToken: {
      type: String,
      default: null,
    },

    TFAEnabled: {
      type: Boolean,
      default: false,
    },

    TFAOTP: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUserDoc>(MODELS.USERS, userSchema);
export { User };
