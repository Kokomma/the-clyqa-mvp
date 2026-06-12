import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Pacifico } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pacifico',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://clyqa.vercel.app'),
  title: 'Clyqa — Get Paid Per View | UGC & Brand Campaigns in Africa',
  description:
    "Brands post campaigns. Creators post content. Everyone earns on performance — no more one-off fees. Join the waitlist for Clyqa, Africa's performance creator marketplace.",
  openGraph: {
    type: 'website',
    title: 'Clyqa — Get Paid Per View | UGC & Brand Campaigns in Africa',
    description:
      "Brands post campaigns. Creators post content. Everyone earns on performance — no more one-off fees. Join the waitlist for Clyqa, Africa's performance creator marketplace.",
    siteName: 'Clyqa',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${pacifico.variable} ${plusJakarta.variable}`}>
      <body className="bg-[#0A0A0A] text-white min-h-screen antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
