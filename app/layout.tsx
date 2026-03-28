import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'devmark — Dashboard',
  description: 'Panel de control devmark con 22 agentes de IA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen" style={{ background: '#0C2D4E', color: '#F1EFE8' }}>

        {/* TOP BAR */}
        <nav style={{
          background: '#0C2D4E',
          borderBottom: '2px solid #1D9E75',
          position: 'sticky',
          top: 0,
          zIndex: 55,
        }}>
          <div style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            height: 56,
          }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                background: '#1D9E75',
                borderRadius: 8,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white"/>
                  <rect x="9" y="1" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.4)"/>
                  <rect x="1" y="9" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.4)"/>
                  <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white"/>
                </svg>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>
                dev<span style={{ color: '#1D9E75' }}>mark</span>
              </span>
              <div style={{
                background: 'rgba(29,158,117,0.18)',
                border: '1px solid rgba(29,158,117,0.35)',
                borderRadius: 99,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
              }}>
                <div className="animate-pulse" style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#1D9E75',
                }} />
                <span style={{
                  color: '#5DCAA5', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                }}>LIVE 24/7</span>
              </div>
            </div>
          </div>
        </nav>

        <main style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 24px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
