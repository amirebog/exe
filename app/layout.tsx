import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from "next-themes";
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Fraunces } from 'next/font/google'
import { VisitTracker } from '@/components/VisitTracker'
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

  metadataBase: new URL('https://zyrixx.vercel.app/'),

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
      url: 'https://zyrixx.vercel.app/',
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
    title: 'Zyrix',
    description:
      'Modern software development, cloud infrastructure, UI/UX design and digital solutions.',
    url: 'https://zyrixx.vercel.app',
    siteName: 'Zyrix',
    type: 'website',
    locale: 'en_US',

    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'Zyrix',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Zyrix',
    description:
      'Modern software development, cloud infrastructure, UI/UX design and digital solutions.',
    images: ['/icon.svg'],
  },


  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: ['/favicon.svg'],
    apple: '/icon.svg',
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

  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <VisitTracker />
          {children}
        </ThemeProvider>

        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}