import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NB-BGC',
  description: 'Candidate Compliance & Payment Engine',
  icons: {
    icon: [
      { url: '/favicon.png' },
      { url: '/icon.png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className="h-screen overflow-hidden bg-[#F4F7FF] text-slate-900 antialiased select-none">
        {children}
      </body>
    </html>
  );
}

