import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Zyrix',
    short_name: 'Zyrix',
    description:
      'Modern software studio focused on web development and digital experiences.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#fafafa',
    orientation: 'portrait',
    lang: 'en',
    categories: ['technology', 'business', 'developer'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
