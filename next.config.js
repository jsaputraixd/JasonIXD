/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next 16 defaults to Turbopack; empty config silences the webpack/turbopack mismatch warning.
  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev) {
      const prev = config.watchOptions?.ignored;
      const prevList = Array.isArray(prev)
        ? prev
        : typeof prev === "string"
          ? [prev]
          : [];
      // Webpack 5 watchOptions.ignored: non-empty glob strings only (no "", RegExp, or functions).
      const ignored = [
        ...prevList,
        "**/public/images/**",
        "**/public/videos/**",
      ].filter((item) => typeof item === "string" && item.length > 0);

      config.watchOptions = {
        ...config.watchOptions,
        ignored,
      };
    }
    return config;
  },
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/favicon.svg" }];
  },
};

module.exports = nextConfig;
