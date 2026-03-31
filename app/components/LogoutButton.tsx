'use client'

import { signOut } from 'next-auth/react'

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      style={{
        marginLeft: 'auto',
        padding: '6px 14px',
        borderRadius: 7,
        border: '1px solid rgba(241,239,232,0.2)',
        background: 'transparent',
        color: 'rgba(241,239,232,0.6)',
        fontSize: 11,
        fontWeight: 600,
        cursor: 'pointer',
        letterSpacing: '0.04em',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        (e.target as HTMLButtonElement).style.background = 'rgba(192,86,33,0.15)'
        ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(192,86,33,0.4)'
        ;(e.target as HTMLButtonElement).style.color = '#F1EFE8'
      }}
      onMouseLeave={e => {
        (e.target as HTMLButtonElement).style.background = 'transparent'
        ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(241,239,232,0.2)'
        ;(e.target as HTMLButtonElement).style.color = 'rgba(241,239,232,0.6)'
      }}
    >
      Cerrar sesión
    </button>
  )
}
