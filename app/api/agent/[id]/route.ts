import pool from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { NextRequest, NextResponse } from 'next/server'

const CORE_API   = process.env.CORE_API_URL    ?? 'http://127.0.0.1:8000'
const API_SECRET = process.env.DASHBOARD_API_SECRET ?? ''

// S1 — Rate limiting en memoria: máx 10 mensajes/min por sesión
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
function checkRateLimit(sessionEmail: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(sessionEmail)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(sessionEmail, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

/** Resuelve el parámetro de ruta (número o slug) al ID numérico del agente. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/^agente\s+/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function resolveAgentId(param: string): Promise<number | null> {
  const numeric = Number(param)
  if (!isNaN(numeric)) return numeric
  // Buscar por slug derivado del nombre
  const res = await pool.query('SELECT id, name FROM agents ORDER BY id')
  const match = res.rows.find((r: { id: number; name: string }) => slugify(r.name) === param)
  return match?.id ?? null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const agentId = await resolveAgentId(id)
  if (agentId === null) return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 })

  const url    = new URL(_req.url)
  const offset = Math.max(0, Number(url.searchParams.get('offset') ?? 0))
  const limit  = 20

  const [agentRes, historyRes, countRes] = await Promise.all([
    pool.query('SELECT * FROM agents WHERE id = $1', [agentId]),
    pool.query(
      `SELECT id, agent_id, role, content, created_at
       FROM (
         SELECT * FROM chat_history WHERE agent_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3
       ) sub ORDER BY created_at ASC`,
      [agentId, limit, offset]
    ),
    pool.query('SELECT COUNT(*) FROM chat_history WHERE agent_id = $1', [agentId]),
  ])

  const total = Number(countRes.rows[0].count)

  return NextResponse.json({
    agent:   agentRes.rows[0] ?? null,
    history: historyRes.rows,
    total,
    offset,
    limit,
    hasMore: offset + limit < total,
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const agentId = await resolveAgentId(id)
  if (agentId === null) return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 })

  const body    = await req.json().catch(() => null)
  const message = (body?.message ?? '').toString().trim()
  if (!message) return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })

  // S3 — Validar longitud máxima
  if (message.length > 2000) {
    return NextResponse.json({ error: 'El mensaje no puede superar los 2000 caracteres' }, { status: 400 })
  }

  // S1 — Rate limit
  const userEmail = (session.user?.email ?? 'unknown')
  if (!checkRateLimit(userEmail)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Espera un minuto.' }, { status: 429 })
  }

  try {
    const coreRes = await fetch(`${CORE_API}/agent/${agentId}/chat`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'x-api-secret':  API_SECRET,
      },
      body: JSON.stringify({ message }),
      signal: AbortSignal.timeout(60_000),
    })

    if (!coreRes.ok) {
      const err = await coreRes.json().catch(() => ({}))
      return NextResponse.json({ error: err.detail ?? 'Error del agente' }, { status: 502 })
    }

    const data = await coreRes.json()
    return NextResponse.json({ ok: true, response: data.response, agent: data.agent })

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error de conexión con devmark-core'
    return NextResponse.json({ error: msg }, { status: 503 })
  }
}
