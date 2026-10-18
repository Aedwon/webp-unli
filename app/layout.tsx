// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { themeInitScript } from '@/lib/theme';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Unlimited WebP Converter by Aedwon',
  description: 'Convert any image to WebP. Free, unlimited, and private. Everything runs in your browser.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <div className="texture" aria-hidden="true">
          <div className="grain" />
        </div>
        {children}
      </body>
    </html>
  );
}
