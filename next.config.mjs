/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        // The only real page on this domain, so the bare domain goes there
        // rather than to a dead placeholder.
        source: "/",
        destination: "/ai-video",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
