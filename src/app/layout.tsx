import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth/context';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Weekly Meal Planner',
  description: 'Plan your weekly meals and generate shopping lists automatically',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
