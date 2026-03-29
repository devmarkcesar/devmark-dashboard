'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/**
 * Muestra un banner solo cuando la sesión expira por inactividad (no por logout manual).
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [expired, setExpired] = useState(false)

  // Ocultar banner si ya navegamos a /login
  useEffect(() => {
    if (pathname === '/login') setExpired(false)
  }, [pathname])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        // Si fue un logout manual, no mostrar banner
        if (sessionStorage.getItem('logout_intentional') === '1') {
          sessionStorage.removeItem('logout_intentional')
          return
        }
        // Sesión expirada por inactividad
        setExpired(true)
        setTimeout(() => {
          router.push('/login')
        }, 2500)
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
