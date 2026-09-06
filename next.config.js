/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /** Hide the bottom-left Next.js issue/dev badge (shows up in showcase recordings). */
  devIndicators: false,
  /**
   * Dev-only tuning: rapid saves generate new `/_next/static/*` URLs. Browsers still
   * holding the previous HTML + chunk list then 404 until a full reload. Debouncing
   * rebuilds and keeping entries warm a bit longer reduces how often that happens.
   */
  onDemandEntries: {
    maxInactiveAge: 2 * 60 * 1000,
    pagesBufferLength: 6,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 400,
      };
    }
    return config;
  },
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/favicon.svg" }];
  },
};

module.exports = nextConfig;
