import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { NextRequest, NextResponse } from 'next/server'

const CORE_API   = process.env.CORE_API_URL         ?? 'http://127.0.0.1:8000'
const API_SECRET = process.env.DASHBOARD_API_SECRET ?? ''

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const message   = (body?.message   ?? '').toString().trim()
  const agent_ids = Array.isArray(body?.agent_ids) ? body.agent_ids : []

  if (!message) return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })

  try {
    const coreRes = await fetch(`${CORE_API}/agent/broadcast`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-secret': API_SECRET },
      body:    JSON.stringify({ message, agent_ids }),
      signal:  AbortSignal.timeout(90_000),
    })

    if (!coreRes.ok) {
      const err = await coreRes.json().catch(() => ({}))
      return NextResponse.json({ error: err.detail ?? 'Error del broadcast' }, { status: 502 })
    }

    const data = await coreRes.json()
    return NextResponse.json(data)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error de conexión con devmark-core'
    return NextResponse.json({ error: msg }, { status: 503 })
  }
}
