/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Disable powered-by header
  poweredByHeader: false,
  
  // Image optimization configuration
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
  
  // Webpack configuration (if needed)
  webpack: (config, { isServer }) => {
    // Add custom webpack configuration if needed
    return config;
  },
  
  // Output configuration
  output: 'standalone', // For better Docker support
  
  // Experimental features (optional)
  experimental: {
    // Enable if needed
  },
};

module.exports = nextConfig;

