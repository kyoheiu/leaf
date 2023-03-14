/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // disable: process.env.NEXT_PUBLIC_NODE_ENV === "development",
});

module.exports = withPWA({
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
  },
  compiler: {
    removeConsole: {
      exclude: ["error"],
    },
  },
});