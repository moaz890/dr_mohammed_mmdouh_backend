import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  GEIDEA_API_PASSWORD: process.env.GEIDEA_API_PASSWORD || '',
  GEIDEA_MERCHANT_PUBLIC_KEY: process.env.GEIDEA_MERCHANT_PUBLIC_KEY || '',
  GEIDEA_BASE_URL: process.env.GEIDEA_BASE_URL || 'https://api.merchant.geidea.net',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};
