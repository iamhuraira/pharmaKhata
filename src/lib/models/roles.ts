import mongoose, { Document, Schema } from 'mongoose';

import { MODELS } from '../constants/common';

interface IRole extends Document {
  name: string;
  permissions: mongoose.Types.ObjectId[];
}

const roleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: true,
    unique: true,
  },

  permissions: [
    {
      type: Schema.Types.ObjectId,
      ref: MODELS.PERMISSIONS,
    },
  ],
});

// Prevent duplicate model compilation
let Role: mongoose.Model<IRole>;
try {
  Role = mongoose.model<IRole>(MODELS.ROLES);
} catch {
  Role = mongoose.model<IRole>(MODELS.ROLES, roleSchema);
}
export { Role };
