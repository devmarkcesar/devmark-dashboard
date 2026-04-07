import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

const CORE_API   = process.env.CORE_API_URL          ?? 'http://127.0.0.1:8000'
const API_SECRET = process.env.DASHBOARD_API_SECRET  ?? ''

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const res = await fetch(`${CORE_API}/jira/sync`, {
      method: 'GET',
      headers: { 'x-api-secret': API_SECRET },
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: err.detail ?? 'Error sincronizando Jira' }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error de conexión con devmark-core'
    return NextResponse.json({ error: msg }, { status: 503 })
  }
}
