import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CookieBanner } from '@/components/ui/cookie-banner';
import { FloatingLiveChat } from '@/components/support/floating-live-chat';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PROP NATION — Trade. Earn. Get Rewarded.',
  description:
    'Earn reward points from eligible prop-firm purchases and redeem them for premium rewards with PROP NATION.',
  openGraph: {
    title: 'PROP NATION — Trade. Earn. Get Rewarded.',
    description:
      'Earn reward points from eligible prop-firm purchases and redeem them for premium rewards with PROP NATION.',
    images: ['/pn-logo-hd.png'],
    type: 'website',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://translate.google.com" />
        <link rel="preconnect" href="https://translate.googleapis.com" />
        <link rel="preconnect" href="https://www.gstatic.com" />
        <link rel="dns-prefetch" href="https://translate.google.com" />
        <link rel="dns-prefetch" href="https://translate.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.gstatic.com" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8fafc] dark:bg-[#06090e] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingLiveChat />
            <CookieBanner />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
