import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Candidate Compliance & Payments Dashboard',
  description: 'Internal post-placement lifecycle & installment collection engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070A0F] antialiased select-none">
        {children}
      </body>
    </html>
  );
}

