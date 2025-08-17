#!/usr/bin/env node

// Only run husky setup if we're not in production/Vercel
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  try {
    console.log('Setting up husky for local development...');
    require('husky');
  } catch (error) {
    console.log('Husky not available, skipping setup...');
  }
} else {
  console.log('Skipping husky setup in production/Vercel environment');
}
