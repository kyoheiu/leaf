/** @type {import('next').NextConfig} */

module.exports = {
  swcMinify: true,
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
  },
  compiler: {
    removeConsole: {
      exclude: ["error"],
    },
  },
};
