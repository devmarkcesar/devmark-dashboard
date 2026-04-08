import type { Metadata } from 'next'
import './globals.css'
import { NavbarWrapper } from './components/NavbarWrapper'
import { AuthGuard } from './components/AuthGuard'

export const metadata: Metadata = {
  title: 'devmark — Dashboard',
  description: 'Panel de control devmark con agentes de IA',
  icons: {
    icon: '/logos/favicon/favicon-verde-v3-1.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen" style={{ background: '#0C2D4E', color: '#F1EFE8' }}>

        {/* TOP BAR */}
        <NavbarWrapper />

        <main style={{ width: '100%' }}>
          <AuthGuard>
            {children}
          </AuthGuard>
        </main>
      </body>
    </html>
  )
}
