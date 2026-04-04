import webpack from "webpack";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Ignore optional test-only deps that yahoo-finance2 references
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /fetch-mock-cache/,
      })
    );
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
    };
    return config;
  },
};

export default nextConfig;
