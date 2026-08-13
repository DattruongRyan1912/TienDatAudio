import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/components/ui/toast'
import { buildAIReadableStructuredData } from '@/lib/seo-strategy'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import SiteAnalytics from '@/components/analytics/SiteAnalytics'
import { getPublicSiteSettings } from '@/lib/public-site-settings'

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-manrope",
});

const themeBootstrapScript = `(()=>{try{const stored=localStorage.getItem('sonic_theme_mode');const preferred=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';const mode=stored==='light'||stored==='dark'?stored:stored==='system'?preferred:'dark';const root=document.documentElement;root.dataset.theme=mode;root.classList.toggle('dark',mode==='dark');root.classList.toggle('light',mode==='light');root.style.colorScheme=mode}catch{}})()`

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
  const { seoConfig, profile } = await getPublicSiteSettings()
  const discoveryStructuredData = buildAIReadableStructuredData(seoConfig, profile)

  return (
    <html lang="vi" data-scroll-behavior="smooth" data-theme="dark" className={`${manrope.variable} dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
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
          <ThemeProvider initialMode="dark">
            <ConditionalLayout profile={profile}>
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
