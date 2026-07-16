import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Fraunces } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const editorial = Fraunces({
  variable: '--font-editorial',
  subsets: ['latin'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://zyrix.dev'),

  title: {
    default: 'Zyrix',
    template: '%s | Zyrix',
  },

  description:
    'Zyrix is a modern digital studio focused on web development, software engineering, UI/UX design, cloud solutions, and innovative digital experiences.',

  applicationName: 'Zyrix',

  generator: 'Next.js',

  referrer: 'origin-when-cross-origin',

  keywords: [
    'Zyrix',
    'Developer',
    'Software Engineer',
    'Web Development',
    'Next.js',
    'React',
    'TypeScript',
    'UI Design',
    'Frontend',
    'Backend',
    'Freelancer',
    'Portfolio',
    'Cloud',
    'Programming',
    'Technology',
  ],

  authors: [
    {
      name: 'Amir',
      url: 'https://zyrix.dev',
    },
  ],

  creator: 'Amir',

  publisher: 'Zyrix',

  category: 'technology',

  alternates: {
    canonical: '/',
  },

  robots: {
    index: true,
    follow: true,

    nocache: false,

    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  openGraph: {
    type: 'website',

    locale: 'en_US',

    url: 'https://zyrix.dev',

    siteName: 'Zyrix',

    title: 'Zyrix',

    description:
      'Modern software development, cloud infrastructure, UI/UX design and digital solutions.',

    countryName: 'Iran',

    images: [
      {
        url: 'https://zyrix.dev/zyrix.png',
        width: 1200,
        height: 630,
        alt: 'Zyrix',
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',

    title: 'Zyrix',

    description:
      'Modern software development, cloud infrastructure, UI/UX design and digital experiences.',

    images: ['/og-image.png'],

    creator: '@zyrix',
  },

  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon.ico',
      },
    ],

    shortcut: ['/favicon.ico'],

    apple: '/apple-touch-icon.png',
  },

  manifest: '/manifest.webmanifest',

  appleWebApp: {
    capable: true,
    title: 'Zyrix',
    statusBarStyle: 'default',
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  verification: {
    google: 'GOOGLE_SITE_VERIFICATION',
    // yandex: '',
    // bing: '',
  },
}

export const viewport: Viewport = {
  width: 'device-width',

  initialScale: 1,

  maximumScale: 1,

  viewportFit: 'cover',

  colorScheme: 'light',

  themeColor: '#FAFAFA',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${editorial.variable}`}
    >
      <body
        className="
          min-h-screen
          overflow-x-hidden
          bg-background
          font-sans
          antialiased
        "
      >
        {children}

        {process.env.NODE_ENV === 'production' && (
          <>
            <Analytics />
          </>
        )}
      </body>
    </html>
  )
}