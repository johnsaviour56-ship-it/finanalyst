/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
      crypto: false,
    };

    // Suppress optional test-only deps in yahoo-finance2
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : []),
      ({ request }, callback) => {
        if (request && request.includes("fetch-mock-cache")) {
          return callback(null, "commonjs " + request);
        }
        callback();
      },
    ];

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["yahoo-finance2", "pdf-parse"],
  },
};

export default nextConfig;
