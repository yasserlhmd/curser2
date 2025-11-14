import type { Metadata } from 'next';
import '../styles/globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Task Manager',
  description: 'Organize and track your tasks efficiently',
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

