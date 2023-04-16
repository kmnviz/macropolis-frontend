const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [
      path.join(__dirname, 'styles')
    ],
  },
  env: {
    DOMAIN_URL: process.env.DOMAIN_URL,
    DOMAIN_NAME: process.env.DOMAIN_NAME,
    BACKEND_URL: process.env.BACKEND_URL,
    IMAGES_URL: `${process.env.GCP_STORAGE_URL}/${process.env.GCP_STORAGE_IMAGES_BUCKET}`,
    AUDIO_PREVIEWS_URL: `${process.env.GCP_STORAGE_URL}/${process.env.GCP_STORAGE_AUDIO_PREVIEWS_BUCKET}`,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  }
}

module.exports = nextConfig
