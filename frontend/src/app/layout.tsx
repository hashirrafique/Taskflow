import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { CommandPaletteProvider } from '@/context/CommandPaletteContext';
import CommandPaletteHost from '@/components/CommandPaletteHost';

export const metadata: Metadata = {
  title: 'TaskFlow — Project Management Platform',
  description:
    'A real-time collaborative task management platform with workspaces, analytics, and team collaboration.',
  keywords: 'task management, project management, team collaboration, kanban, productivity',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Jost:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <CommandPaletteProvider>
                {children}
                <CommandPaletteHost />
              </CommandPaletteProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
