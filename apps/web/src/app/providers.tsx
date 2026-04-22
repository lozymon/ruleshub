'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/auth-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
      themes={['dark', 'light']}
    >
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
