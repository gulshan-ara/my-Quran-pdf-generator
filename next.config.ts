/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This helps with serverless function packaging
    serverComponentsExternalPackages: ["@sparticuz/chromium"],
  },
};

module.exports = nextConfig;
