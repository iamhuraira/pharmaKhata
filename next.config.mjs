import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['.'],
  },
  poweredByHeader: false,
  reactStrictMode: false,
  experimental: {
    // serverComponentsExternalPackages: ['@electric-sql/pglite'],
  },
  webpack(config, { isServer, dev }) {
    // Add SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: [{ loader: '@svgr/webpack', options: { icons: true } }],
    });

    // Ensure proper path resolution for @/ alias
    if (!config.resolve) {
      config.resolve = {};
    }
    
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }

    // Add explicit alias resolution
    config.resolve.alias['@'] = path.resolve(process.cwd(), 'src');
    
    // Add fallbacks for Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    // Add debugging for Vercel builds
    if (process.env.VERCEL) {
      console.log('🔧 Vercel build detected - webpack config:', {
        aliases: config.resolve.alias,
        fallbacks: config.resolve.fallback,
      });
    }

    return config;
  },
};

export default nextConfig;
