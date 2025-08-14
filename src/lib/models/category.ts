// src/models/category.model.ts

import mongoose, { Document, Schema, Types } from 'mongoose';

import { MODELS } from '../constants/common';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  urduName?: string;
  description?: string;
}

const categorySchema = new Schema<ICategory>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new Types.ObjectId(),
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    urduName: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate model compilation
let Category: mongoose.Model<ICategory>;
try {
  Category = mongoose.model<ICategory>(MODELS.CATEGORY);
} catch {
  Category = mongoose.model<ICategory>(MODELS.CATEGORY, categorySchema);
}
export { Category };
