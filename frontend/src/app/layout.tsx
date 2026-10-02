import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CookieBanner } from '@/components/ui/cookie-banner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PropNation — Trade. Earn. Get Rewarded.',
  description:
    'Purchase eligible prop-firm challenges with our affiliate codes, verify your purchase, earn reward points, and redeem them for tech gear, gadgets, and gift cards.',
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-900 dark:bg-[#090d16] dark:text-slate-100 font-sans transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieBanner />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
