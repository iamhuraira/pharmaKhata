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
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [{ loader: '@svgr/webpack', options: { icons: true } }],
    });
    return config;
  },
};

export default nextConfig;
