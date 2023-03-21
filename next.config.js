const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [
      path.join(__dirname, 'styles')
    ],
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
    IMAGES_URL: `${process.env.GCP_STORAGE_URL}/${process.env.GCP_STORAGE_IMAGES_BUCKET}`,
  }
}

module.exports = nextConfig
