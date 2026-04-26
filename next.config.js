/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  turbopack: {},
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    // wasm-vips browser ESM entry uses import.meta but package.json says "type":"commonjs"
    config.module.rules.push({
      test: /node_modules\/wasm-vips\/lib\/vips-es6\.js$/,
      type: 'javascript/esm',
    });
    return config;
  },
};

module.exports = nextConfig;
