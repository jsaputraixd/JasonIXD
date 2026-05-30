/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next 16 defaults to Turbopack; empty config silences the webpack/turbopack mismatch warning.
  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev) {
      const prev = config.watchOptions?.ignored;
      const prevList = Array.isArray(prev)
        ? prev.filter(Boolean)
        : prev
          ? [prev].filter(Boolean)
          : [];
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          ...prevList,
          "**/public/images/**",
          "**/public/videos/**",
        ],
      };
    }
    return config;
  },
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/favicon.svg" }];
  },
};

module.exports = nextConfig;
