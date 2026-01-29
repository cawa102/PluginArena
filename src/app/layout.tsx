import type { ReactNode } from 'react';

// This layout is required but delegated to [locale]/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
