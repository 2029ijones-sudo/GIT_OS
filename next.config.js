/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Custom webpack config for our routing
  webpack: (config, { isServer }) => {
    // Handle #@ routes on client side
    if (!isServer) {
      config.resolve.alias['#@'] = path.resolve(__dirname, 'components');
    }
    return config;
  },
  
  // Custom rewrites for our API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
      // Handle our custom routes
      {
        source: '/#@:path*',
        destination: '/',
      },
    ];
  },
  
  // Allow hash in URLs
  trailingSlash: false,
}

module.exports = nextConfig
