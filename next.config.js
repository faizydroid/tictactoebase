/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true, // Required for Cloudflare Pages
  },
  // Disable static optimization for pages that use Supabase
  experimental: {
    // This ensures environment variables are available at build time
  },
}

module.exports = nextConfig