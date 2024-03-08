/** @type {import('next').NextConfig} */
const withTM = require("next-transpile-modules")([
  "@pusher/push-notifications-web",
]);

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: "source.unsplash.com",
      },
      {
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

module.exports = withTM(nextConfig);
