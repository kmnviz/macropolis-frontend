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
  }
}

module.exports = nextConfig
