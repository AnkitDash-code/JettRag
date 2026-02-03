/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for Transformers.js in browser
    config.resolve.alias = {
      ...config.resolve.alias,
      'sharp$': false,
      'onnxruntime-node$': false,
    };

    // Disable WebAssembly optimization warnings
    config.infrastructureLogging = {
      level: 'error',
    };

    return config;
  },
  // Enable static export for GitHub Pages deployment
  output: 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
