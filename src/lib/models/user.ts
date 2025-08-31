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
    required: false,
    default: '',
  },

  state: {
    type: String,
    required: false,
    default: '',
  },

  zip: {
    type: String,
    required: false,
    default: '',
  },

  country: {
    type: String,
    required: false,
    default: 'Pakistan',
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

    email: {
      type: String,
      required: false,
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

    // Customer balance field
    balance: {
      type: Number,
      default: 0,
      required: false,
    },

    // Soft delete fields
    deletedAt: {
      type: Date,
      required: false,
      default: null,
    },

    deletedBy: {
      type: String,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate model compilation
let User: mongoose.Model<IUserDoc>;
try {
  // Delete the existing model to force recompilation with new schema
  mongoose.deleteModel(MODELS.USERS);
  User = mongoose.model<IUserDoc>(MODELS.USERS, userSchema);
} catch {
  User = mongoose.model<IUserDoc>(MODELS.USERS, userSchema);
}
export { User };
