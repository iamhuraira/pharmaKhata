// src/models/category.model.ts

import { Document, model, Schema, Types } from 'mongoose';

import { MODELS } from '@/common/constants/common';

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

export const Category = model<ICategory>(MODELS.CATEGORY, categorySchema);
