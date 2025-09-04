/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ['@dash/types', '@dash/utils'],
  images: {
    domains: ['images.unsplash.com'],
  },
}

module.exports = nextConfig