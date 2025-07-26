import mongoose, { Document, Schema } from 'mongoose';

import { MODELS } from '../constants/common';

interface ISiteInfo extends Document {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  logoUrl: string;
  faviconUrl: string;
}

const siteInfoSchema = new Schema<ISiteInfo>({
  siteName: {
    type: String,
    required: true,
  },

  siteDescription: {
    type: String,
    required: true,
  },

  contactEmail: {
    type: String,
    required: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address'],
  },

  contactPhone: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  socialLinks: {
    facebook: {
      type: String,
      default: '',
    },

    twitter: {
      type: String,
      default: '',
    },

    linkedin: {
      type: String,
      default: '',
    },

    instagram: {
      type: String,
      default: '',
    },
  },

  logoUrl: {
    type: String,
    required: true,
  },
});

export const SiteInfo = mongoose.model<ISiteInfo>(MODELS.SITE_INFO, siteInfoSchema);
