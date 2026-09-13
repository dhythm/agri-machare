/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@electric-sql/pglite'],
}

export default nextConfig
