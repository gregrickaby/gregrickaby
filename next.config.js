/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["res.cloudinary.com"],
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
