'use client'
import { useEffect } from 'react'

export function AutoPrint() {
  useEffect(() => {
    // Esperar a que el CSS de impresión y las imágenes carguen
    const timer = setTimeout(() => window.print(), 800)
    return () => clearTimeout(timer)
  }, [])
  return null
}
