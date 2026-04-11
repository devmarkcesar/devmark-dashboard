'use client'
import { useEffect } from 'react'

export function AutoPrint() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print()
      // Cerrar la ventana/pestaña después de que el diálogo de impresión cierre
      window.addEventListener('afterprint', () => window.close(), { once: true })
    }, 800)
    return () => clearTimeout(timer)
  }, [])
  return null
}
