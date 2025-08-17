import mongoose, { Document, Schema } from 'mongoose';

import { MODELS } from '../constants/common';

interface IPermission extends Document {
  name: string;
  description?: string;
}

const permissionSchema = new Schema<IPermission>({
  name: {
    type: String,
    required: true,
    unique: true,
  },

  description: { type: String },
});

// Prevent duplicate model compilation
let Permission: mongoose.Model<IPermission>;
try {
  Permission = mongoose.model<IPermission>(MODELS.PERMISSIONS);
} catch {
  Permission = mongoose.model<IPermission>(MODELS.PERMISSIONS, permissionSchema);
}
export { Permission };
