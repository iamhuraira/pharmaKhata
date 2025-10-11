  import dotenv from 'dotenv';
import { cleanEnv, host, num, port, str, testOnly } from 'envalid';
import fs from 'fs';
import path from 'path';

const nodeEnvironment = process.env.NODE_ENV || 'development';

const envPath = nodeEnvironment !== 'production' ? path.resolve(process.cwd(), `.env.${nodeEnvironment}`) : null;

if (envPath && fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  if (nodeEnvironment !== 'production') {
    console.error(`Environment file .env.${process.env.NODE_ENV} not found`);
  }
}

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ devDefault: testOnly('test'), choices: ['development', 'production', 'production.local', 'test'] }),
  HOST: host({ devDefault: 'localhost', default: '0.0.0.0' }),
  PORT: port({ devDefault: 3000, default: 3000 }),
  CORS_ORIGIN: str({ 
    devDefault: 'http://localhost:3001;http://localhost:3000', 
    default: process.env.CORS_ORIGIN || 'https://your-domain.com' 
  }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: 1000, default: 100 }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: 1000, default: 60000 }),
  MONGO_URL: str({ 
    devDefault: 'mongodb://localhost:27017/pharmaKhata',
    default: process.env.MONGO_URL || 'mongodb://localhost:27017/pharmaKhata'
  }),
  JWT_SECRET_KEY: str({ 
    devDefault: 'dev_jwt_secret_key_pharmakhata_2024', 
    default: process.env.JWT_SECRET_KEY || 'your_very_strong_jwt_secret_key_for_production_2024' 
  }),
  JWT_EXPIRES_IN: str({ devDefault: '1d', default: '24h' }),
  BCRYPT_SALT_ROUNDS: num({ devDefault: 10, default: 12 }),
  // default: 'mongodb+srv://iamhuraira429:o0RO84l6TjbgQB5S@hurii.8wtzhom.mongodb.net/pharmaKhata?retryWrites=true&w=majority&appName=hurii' 
  // cloudinary
  // CLOUDINARY_CLOUD_NAME: str({ devDefault: testOnly(''), desc: 'Cloudinary cloud name' }),
  // CLOUDINARY_API_KEY: str({ devDefault: testOnly(''), desc: 'Cloudinary api key' }),
  // CLOUDINARY_API_SECRET: str({ devDefault: testOnly(''), desc: 'Cloudinary api secret' }),

  // REDIS
  // REDIS_HOST: str({ devDefault: testOnly('redis') }), // for docker in developmet: 'redis' which is the name of the service in docker-compose.dev.yml otherwise use the
  // '127.0.0.1'
  // REDIS_PORT: num({ devDefault: testOnly(6379) }),

  // OPENAI
  // OPENAI_API_KEY: str({ devDefault: testOnly(''), desc: 'OpenAI API key' }),

  //Stripe Keys
  // STRIPE_SECRET_KEY: str({ devDefault: testOnly(''), desc: 'Stripe Private Key' }),

  //Client Url
  // CLIENT_URL: str({ devDefault: testOnly('http://localhost:3000'), desc: 'Client URL' }),

  //Stripe Webhook Secret
  // STRIPE_WEBHOOK_SECRET: str({ devDefault: testOnly(''), desc: 'Stripe Webhook Secret' }),

  //Stripe Customer Billing Portal Test Url
  // STRIPE_CUSTOMER_BILLING_PORTAL_TEST_URL: str({
  //   devDefault: testOnly(''),
  //   desc: 'Stripe Customer Billing Portal Test URL',
  // }),
});
