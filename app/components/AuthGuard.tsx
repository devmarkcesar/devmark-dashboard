'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/**
 * Componente que envuelve páginas protegidas.
 * Muestra un banner si la sesión expiró y redirige a /login.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    // Escuchar cambios de sesión en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        // TOKEN_REFRESHED es normal; solo actuar en SIGNED_OUT
        if (event === 'SIGNED_OUT') {
          setExpired(true)
          setTimeout(() => {
            router.push('/login')
          }, 2500)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  return (
    <>
      {expired && (
        <div style={{
          position: 'fixed',
          top: 64,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          background: '#C05621',
          color: '#fff',
          padding: '10px 24px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.3s ease',
        }}>
          ⚠️ Tu sesión expiró. Redirigiendo al login...
        </div>
      )}
      {children}
    </>
  )
}
