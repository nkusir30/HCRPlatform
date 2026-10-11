/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Type-checking and linting run during builds so type errors fail fast.
  // (The stray TimesheetLifecycleCard.ts that imported the undeclared "sonner"
  // dep has been removed, so the previous ignoreBuildErrors escape hatch is gone.)
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
};

module.exports = nextConfig;

