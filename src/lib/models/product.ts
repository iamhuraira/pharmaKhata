// src/models/product.model.ts

import { Document, model, Schema, Types } from 'mongoose';

import { MODELS } from '@/common/constants/common';

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  shortDescription?: string;
  urduDescription?: string;
  quantity: number;
  categoryId: Types.ObjectId;
  size?: number; // Now at root level (e.g., 120, 240)
  packType: string; // Now at root level (e.g., "ml", "Tabs")
  price: number; // Now at root level
}

const productSchema = new Schema<IProduct>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new Types.ObjectId(),
    },
    name: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
    },
    urduDescription: {
      type: String,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: MODELS.CATEGORY,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    size: {
      type: Number,
      required: false, // Optional for products that don't have size
    },
    packType: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = model<IProduct>(MODELS.PRODUCT, productSchema);
