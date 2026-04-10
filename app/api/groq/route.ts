import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

const CORE_API   = process.env.CORE_API_URL         ?? 'http://127.0.0.1:8000'
const API_SECRET = process.env.DASHBOARD_API_SECRET ?? ''

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const res = await fetch(`${CORE_API}/groq/status`, {
      headers: { 'x-api-secret': API_SECRET },
      cache: 'no-store',
    })
    if (!res.ok) return NextResponse.json({ error: 'Error al obtener estado de Groq' }, { status: res.status })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Sin conexión con devmark-core' }, { status: 503 })
  }
}
