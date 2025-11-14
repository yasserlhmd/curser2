'use client';

/**
 * Providers Component
 * Wraps the app with client-side providers
 * This allows the root layout to remain a server component
 */
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      {children}
    </AuthProvider>
  );
}

