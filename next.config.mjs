/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Allow GitHub Pages deployments by configuring basePath/assetPrefix via env
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    unoptimized: true
  },
  reactStrictMode: true
};

export default nextConfig;
