'use client'

import { usePathname } from 'next/navigation'
import { LogoutButton } from './LogoutButton'

export function NavbarWrapper() {
  const pathname = usePathname()

  if (pathname === '/login') return null

  return (
    <nav style={{
      background: '#0C2D4E',
      borderBottom: '2px solid #1D9E75',
      position: 'sticky',
      top: 0,
      zIndex: 55,
    }}>
      <div className="navbar-inner">
        {/* Hamburger — solo móvil, oculto en escritorio vía CSS */}
        <button
          className="navbar-hamburger"
          onClick={() => window.dispatchEvent(new CustomEvent('devmark:toggle-sidebar'))}
          aria-label="Abrir menú"
        >&#9776;</button>

        {/* Logo */}
        <img
          src="/logos/horizontal/dev-hori-v7-1.png"
          alt="devmark"
          style={{ height: 44, width: 'auto', objectFit: 'contain' }}
        />

        {/* Derecha: LIVE 24/7 + Cerrar sesión */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
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
          <LogoutButton />
        </div>
      </div>
    </nav>
  )
}
