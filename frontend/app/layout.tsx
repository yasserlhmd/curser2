import type { Metadata } from 'next';
import '../styles/globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: {
    default: 'Task Manager',
    template: '%s | Task Manager',
  },
  description: 'Organize and track your tasks efficiently',
  keywords: ['task management', 'productivity', 'tasks'],
  authors: [{ name: 'Task Manager Team' }],
  creator: 'Task Manager',
  publisher: 'Task Manager',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Task Manager',
    title: 'Task Manager - Organize and Track Your Tasks',
    description: 'Efficiently manage and organize your tasks',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Task Manager',
    description: 'Organize and track your tasks efficiently',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

