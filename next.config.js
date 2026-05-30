/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next 16 defaults to Turbopack; empty config silences the webpack/turbopack mismatch warning.
  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev) {
      const prev = config.watchOptions?.ignored;
      const prevList = Array.isArray(prev)
        ? prev.filter(
            (item) =>
              (typeof item === "string" && item.length > 0) ||
              item instanceof RegExp
          )
        : typeof prev === "string" && prev.length > 0
          ? [prev]
          : prev instanceof RegExp
            ? [prev]
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
