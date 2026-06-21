/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  eslint: {
    ignoreDuringBuilds: false
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.sparkrobot.top"
          }
        ],
        destination: "https://sparkrobot.top/:path*",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
