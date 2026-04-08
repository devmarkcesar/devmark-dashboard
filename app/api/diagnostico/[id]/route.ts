import pool from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { NextRequest, NextResponse } from 'next/server'
import { buildPmPrompt, budgetMap, urgencyMap, solutionMap } from '../route'

const CORE_API   = process.env.CORE_API_URL         ?? 'http://127.0.0.1:8000'
const API_SECRET = process.env.DASHBOARD_API_SECRET ?? ''


function extractJSON(raw: string): Record<string, unknown> | null {
  const text = raw.trim()
  try { return JSON.parse(text) } catch { /* continuar */ }
  const mdMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (mdMatch) { try { return JSON.parse(mdMatch[1].trim()) } catch { /* continuar */ } }
  const start = text.indexOf('{')
  const end   = text.lastIndexOf('}')
  if (start !== -1 && end > start) { try { return JSON.parse(text.slice(start, end + 1)) } catch { /* continuar */ } }
  return null
}

// GET — obtener diagnóstico por ID (protegido por sesión)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const res = await pool.query('SELECT * FROM diagnosticos WHERE id = $1', [numId])
  if (res.rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const row = res.rows[0]
  const diagnostico = {
    ...row,
    propuesta: typeof row.propuesta === 'string' ? JSON.parse(row.propuesta) : row.propuesta,
  }
  return NextResponse.json({ diagnostico })
}

// DELETE — eliminar diagnóstico
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  await pool.query('DELETE FROM diagnosticos WHERE id = $1', [numId])
  return NextResponse.json({ ok: true })
}

// PATCH — regenerar propuesta con IA usando datos existentes
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const dbRes = await pool.query('SELECT * FROM diagnosticos WHERE id = $1', [numId])
  if (dbRes.rows.length === 0) return NextResponse.json({ error: 'Diagnóstico no encontrado' }, { status: 404 })

  const diag = dbRes.rows[0]
  const pmPrompt = await buildPmPrompt({
    ...diag,
    solutionMap,
    budgetMap,
    urgencyMap,
  })

  await pool.query('UPDATE diagnosticos SET status=$1 WHERE id=$2', ['pendiente', numId])

  try {
    const coreRes = await fetch(`${CORE_API}/agent/2/raw`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-secret': API_SECRET },
      body:    JSON.stringify({ message: pmPrompt }),
      signal:  AbortSignal.timeout(90_000),
    })

    if (!coreRes.ok) {
      await pool.query('UPDATE diagnosticos SET status=$1 WHERE id=$2', ['error', numId])
      return NextResponse.json({ error: 'Error al generar propuesta' }, { status: 502 })
    }

    const coreData  = await coreRes.json()
    let   rawOutput = coreData.response ?? ''
    let   propuesta = extractJSON(rawOutput)

    // Detectar rate limit de Groq (429)
    if (rawOutput.includes('429') || rawOutput.includes('rate_limit_exceeded')) {
      await pool.query('UPDATE diagnosticos SET status=$1, raw_output=$2 WHERE id=$3', ['error', rawOutput, numId])
      const match    = rawOutput.match(/try again in ([^\s"]+)/i)
      const retryMsg = match ? ` Espera aproximadamente ${match[1]}.` : ' Espera unos minutos e intenta de nuevo.'
      return NextResponse.json(
        { error: `Límite diario de Groq alcanzado.${retryMsg}`, rateLimit: true },
        { status: 429 }
      )
    }

    if (!propuesta) {
      const retryPrompt = `El JSON que devolviste no pudo parsearse. Devuelve SOLAMENTE el objeto JSON sin ningún texto adicional. Aquí estaba la respuesta anterior:\n\n${rawOutput}\n\nExtrae los datos y devuélvelos SOLO como JSON puro empezando con { y terminando con }.`
      try {
        const retryRes = await fetch(`${CORE_API}/agent/2/raw`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-secret': API_SECRET },
          body:    JSON.stringify({ message: retryPrompt }),
          signal:  AbortSignal.timeout(60_000),
        })
        if (retryRes.ok) {
          const retryData = await retryRes.json()
          rawOutput = retryData.response ?? rawOutput
          propuesta = extractJSON(rawOutput)
        }
      } catch { /* usar lo que tenemos */ }
    }

    try {
      await pool.query(
        'UPDATE diagnosticos SET propuesta=$1, raw_output=$2, status=$3 WHERE id=$4',
        [propuesta ? JSON.stringify(propuesta) : null, rawOutput, propuesta ? 'completado' : 'parcial', numId]
      )
    } catch (updateErr) { console.error('Error al actualizar:', updateErr) }

    return NextResponse.json({
      ok:          true,
      diagnostico: { ...diag, propuesta, status: propuesta ? 'completado' : 'parcial' },
    })

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error de conexión'
    try { await pool.query('UPDATE diagnosticos SET status=$1 WHERE id=$2', ['error', numId]) } catch { /* ignorar */ }
    return NextResponse.json({ error: msg }, { status: 503 })
  }
}
