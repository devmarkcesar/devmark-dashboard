'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', { email, password, redirect: false })

    if (result?.error) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
      setLoading(false)
      return
    }

    window.location.href = '/'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0C2D4E',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 16px',
    }}>

      {/* Card */}
      <div style={{
        background: '#F1EFE8',
        borderRadius: 14,
        padding: '36px 40px',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0C2D4E', marginBottom: 4 }}>
          Iniciar sesión
        </h1>
        <p style={{ fontSize: 13, color: '#8A8A87', marginBottom: 28 }}>
          Acceso restringido — devmark
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#444441', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="correo@ejemplo.com"
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid #DDD9D0',
                background: '#fff',
                fontSize: 14,
                color: '#0C2D4E',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#1D9E75'}
              onBlur={e => e.target.style.borderColor = '#DDD9D0'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#444441', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid #DDD9D0',
                background: '#fff',
                fontSize: 14,
                color: '#0C2D4E',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#1D9E75'}
              onBlur={e => e.target.style.borderColor = '#DDD9D0'}
            />
          </div>

          {error && (
            <p style={{
              fontSize: 12, color: '#C05621',
              background: 'rgba(192,86,33,0.08)',
              border: '1px solid rgba(192,86,33,0.2)',
              borderRadius: 7, padding: '8px 12px',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: '12px 0',
              borderRadius: 8,
              border: 'none',
              background: loading ? '#8A8A87' : '#1D9E75',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              letterSpacing: '0.01em',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar →'}
          </button>
        </form>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 32, paddingTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <img
          src="/logos/horizontal/dev-hori-v7-1.png?v=2"
          alt="devmark"
          style={{ height: 62, width: 'auto', objectFit: 'contain' }}
        />
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: 500 }}>© {new Date().getFullYear()} devmark</p>
      </footer>
    </div>
  )
}
