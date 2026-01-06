/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Allow images from any domain for development
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
