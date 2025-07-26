import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import { SiteInfo } from '@/common/models/siteInfo';
import { APIResponse } from '@/common/utils/response';

export const createSiteInfo = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return APIResponse.error(res, 'siteInfo detail are required', null, StatusCodes.BAD_REQUEST);
    }

    const existingsiteInfo = await SiteInfo.findOne({ siteName: req.body.siteName });

    if (existingsiteInfo) {
      return APIResponse.error(res, 'siteInfo already exists', null, StatusCodes.BAD_REQUEST);
    }
    const siteInfos = new SiteInfo(req.body);
    await siteInfos.save();
    return APIResponse.success(res, 'siteInfo created successfully', { siteInfos }, StatusCodes.CREATED);
  } catch (error) {
    console.error('Error creating siteInfo:', error);
    return APIResponse.error(res, 'Error creating siteInfo', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const getSiteInfo = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (page <= 0 || limit <= 0) {
      return APIResponse.error(res, 'Invalid page or limit value', null, StatusCodes.BAD_REQUEST);
    }

    const totalCount = await SiteInfo.countDocuments();
    const siteInfos = await SiteInfo.find().skip(skip).limit(limit);

    if (siteInfos.length === 0) {
      return APIResponse.error(res, 'No siteInfo found', null, StatusCodes.NOT_FOUND);
    }

    //   const totalPages = Math.ceil(totalCount / limit);

    return APIResponse.success(
      res,
      'Successfully retrieved siteInfo',
      {
        totalItems: totalCount,
        siteInfos,
      },
      StatusCodes.OK
    );
  } catch (error) {
    console.error('Error fetching siteInfo:', error);
    return APIResponse.error(res, 'Failed to fetch siteInfo', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
export const updateSiteInfo = async (req: Request, res: Response) => {
  const { id } = req.query;
  const SiteInfoData = req.body;

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id.toString())) {
      return APIResponse.error(
        res,
        'siteInfo ID is required and must be a valid ObjectId',
        null,
        StatusCodes.BAD_REQUEST
      );
    }

    const siteInfos = await SiteInfo.findByIdAndUpdate(id, SiteInfoData, { new: true });

    if (!siteInfos) {
      return APIResponse.error(res, 'No siteInfo found', null, StatusCodes.NOT_FOUND);
    }
    await siteInfos.save();

    return APIResponse.success(res, 'siteInfo updated successfully', { siteInfos });
  } catch (error) {
    console.error('Error updating siteInfo:', error);
    return APIResponse.error(res, 'Failed to update siteInfo', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const deleteSiteInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    if (!id) {
      return APIResponse.error(res, 'siteInfo ID is required', null, StatusCodes.BAD_REQUEST);
    }
    let siteInfos;
    if (id) {
      siteInfos = await SiteInfo.findById(id);
    }
    if (!siteInfos) {
      return APIResponse.error(res, 'siteInfo not found', null, StatusCodes.NOT_FOUND);
    }
    await siteInfos.deleteOne();

    return APIResponse.success(res, 'siteInfo deleted successfully');
  } catch (error) {
    console.error('Error deleting siteInfo:', error);
    return APIResponse.error(res, 'Failed to delete siteInfo', error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
