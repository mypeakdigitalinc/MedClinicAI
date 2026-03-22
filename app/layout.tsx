import type {Metadata} from 'next';
import './globals.css'; // Global styles
import {AuthProvider} from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'MedClinic AI App',
  description: 'MedClinic AI Studio App',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
