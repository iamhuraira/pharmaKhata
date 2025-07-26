import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import multer from 'multer';

import { env } from '@/common/utils/envConfig';

export const UploadImage = multer({ dest: 'public/images' });

export const uploadFileToCloudinary = async (filePath: string) => {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
    });
    fs.unlinkSync(filePath);
    return result;
  } catch (error: any) {
    fs.unlinkSync(filePath);
    throw new Error(error.message);
  }
};

export const deleteFileFromCloudinary = async (url: string) => {
  const publicId = url.split('/').pop()?.split('.')[0];
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    } else {
      throw new Error('Invalid URL');
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};
