import type { Viewport } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { ToastProvider } from '@/components/ui/toast'
import { buildAIReadableStructuredData, getSEOConfig } from '@/lib/seo-strategy'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-manrope",
});

// Metadata is handled by individual pages
// export const metadata: Metadata = generateSEOMetadata({
//   pagePath: '/'
// })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const seoConfig = await getSEOConfig()
  const discoveryStructuredData = buildAIReadableStructuredData(seoConfig)

  return (
    <html lang="vi" data-scroll-behavior="smooth" className={`${manrope.variable} dark`}>
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
          <SettingsProvider>
            <ThemeProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </ThemeProvider>
          </SettingsProvider>
        </ToastProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
