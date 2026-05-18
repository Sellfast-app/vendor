import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      // CRITICAL: Don't cache any API routes
      urlPattern: /^https?.*\/api\/.*$/,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'api-cache',
      },
    },
    {
      // Don't cache auth-related pages
      urlPattern: /^https?.*\/(login|signup|auth).*$/,
      handler: 'NetworkOnly',
    },
    {
      // Cache static assets aggressively
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|woff|woff2)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      // Cache other pages but always try network first
      urlPattern: /^https?.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  images: {
    // Legacy domains config
    domains: [
      'res.cloudinary.com',
      'api.swiftree.app',
      'api-staging-africa-705709517595.africa-south1.run.app',
      'staging.swiftree.app',
      'swiftree-foodvendorpull.b-cdn.net', // Add this line
    ],
    // Recommended remotePatterns config
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.swiftree.app', 
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'swiftree-foodvendorpull.b-cdn.net', // Add this block
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.b-cdn.net', // Add wildcard for any BunnyCDN subdomain
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);