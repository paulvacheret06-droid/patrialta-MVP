import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Strict mode pour détecter les effets de bord React
  reactStrictMode: true,

  // Optimisation des images (monuments historiques)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.pop.culture.gouv.fr',
      },
    ],
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
