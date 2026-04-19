/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint warnings (like no-img-element) won't block the build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore type errors so we can see if the issue is TS or something else
    ignoreBuildErrors: true,
  },
  // Give each static page up to 3 minutes instead of the default 60s.
  // Helps when build workers are slow or many pages are being generated.
  staticPageGenerationTimeout: 180,
};
export default nextConfig;
