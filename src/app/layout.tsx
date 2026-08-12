import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { Manrope } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/components/ui/toast'
import { buildAIReadableStructuredData, getSEOConfig } from '@/lib/seo-strategy'
import { getBusinessProfile } from '@/lib/business-profile'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import SiteAnalytics from '@/components/analytics/SiteAnalytics'
import type { ThemeMode } from '@/contexts/ThemeContext'
import { assistantPublicEnabled } from '@/modules/assistant/infrastructure/assistant-config'

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tiendataudioquangngai.id.vn'),
  applicationName: 'Tiến Đạt Audio',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/images/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    apple: [{ url: '/images/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#080808' },
    { media: '(prefers-color-scheme: light)', color: '#f4f2ee' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeCookie = (await cookies()).get('sonic_theme')?.value
  const initialMode: ThemeMode = themeCookie === 'light' || themeCookie === 'system' ? themeCookie : 'dark'
  const [seoConfig, profile] = await Promise.all([getSEOConfig(), getBusinessProfile()])
  const discoveryStructuredData = buildAIReadableStructuredData(seoConfig, profile)

  return (
    <html lang="vi" data-scroll-behavior="smooth" data-theme={initialMode === 'light' ? 'light' : 'dark'} className={`${manrope.variable} ${initialMode === 'light' ? 'light' : 'dark'}`}>
      <head>
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable site information" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(discoveryStructuredData),
          }}
        />
      </head>
      <body className="antialiased min-h-screen">
        <ToastProvider>
          <ThemeProvider initialMode={initialMode}>
            <ConditionalLayout profile={profile} assistantEnabled={assistantPublicEnabled()}>
              {children}
            </ConditionalLayout>
          </ThemeProvider>
        </ToastProvider>
        <SiteAnalytics />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
