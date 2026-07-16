import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://zyrix.dev'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
      },
      {
    userAgent: '*',
    allow: '/',
    disallow: [
      '/admin',
      '/dashboard',
      '/api',
    ],
  },
    ],

    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}