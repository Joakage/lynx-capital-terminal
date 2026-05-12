/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // yahoo-finance2 ships its test files inside esm/tests with Deno-only imports;
  // keeping it external prevents webpack from trying to bundle those.
  // @prisma/client must also stay external so the generated client resolves at runtime.
  serverExternalPackages: ["yahoo-finance2", "@prisma/client", ".prisma/client"],
};

export default nextConfig;
