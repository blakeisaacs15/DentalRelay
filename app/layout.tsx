import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DentalRelay — Dental Referral Management',
  description: 'HIPAA-compliant dental referral management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="h-full antialiased">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
