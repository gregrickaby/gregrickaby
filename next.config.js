/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["res.cloudinary.com", "secure.gravatar.com"],
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
