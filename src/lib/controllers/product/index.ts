import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Product } from '@/common/models/product';
import { APIResponse } from '@/common/utils/response';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().exec();
    return APIResponse.success(res, 'Products fetched successfully', { products: products }, StatusCodes.OK);
  } catch (error) {
    console.error('Error fetching products:', error);
    return APIResponse.error(res, 'Error fetching products', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const updateProductQuantity = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    console.log('productId:', productId);
    console.log('req.body:', req.body);
    const product = await Product.findById(productId).exec();
    if (!product) {
      return APIResponse.error(res, 'Product not found', null, StatusCodes.NOT_FOUND);
    }

    await Product.findByIdAndUpdate(productId, { $inc: { quantity: req.body.quantity } }, { new: true }).exec();
    return APIResponse.success(res, 'Product Stock Updated successfully', StatusCodes.OK);
  } catch (error) {
    console.error('Error updating product:', error);
    return APIResponse.error(res, 'Error updating product', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
