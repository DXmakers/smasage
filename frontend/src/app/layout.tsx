import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '../components/features/wallet/WalletContext';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Smasage | AI Portfolio Manager',
  description: 'AI Portfolio Manager natively on Stellar',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className={outfit.className}>
        <WalletProvider>
          <ErrorBoundary fallbackMessage="The app ran into a problem. Please try again.">
            {children}
          </ErrorBoundary>
        </WalletProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#000',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
      </body>
    </html>
  );
}
