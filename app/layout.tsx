import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'devmark OS — Dashboard',
  description: 'Panel de control del sistema devmark OS con 22 agentes de IA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#0a0a0a] text-white">
        <nav className="border-b border-gray-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <h1 className="text-xl font-bold">devmark OS</h1>
            </div>
            <span className="text-sm text-gray-400">Dashboard · 22 Agentes IA</span>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
