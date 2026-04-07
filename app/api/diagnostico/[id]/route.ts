import pool from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { NextRequest, NextResponse } from 'next/server'

const CORE_API   = process.env.CORE_API_URL         ?? 'http://127.0.0.1:8000'
const API_SECRET = process.env.DASHBOARD_API_SECRET ?? ''

const budgetMap: Record<string, string> = {
  'menos_5k':    'menos de $5,000 MXN',
  '5k_15k':      'entre $5,000 y $15,000 MXN',
  '15k_50k':     'entre $15,000 y $50,000 MXN',
  'mas_50k':     'más de $50,000 MXN',
  'no_definido': 'presupuesto no definido aún',
}
const urgencyMap: Record<string, string> = {
  'inmediata': 'urgente, lo antes posible',
  '1_mes':     'en el próximo mes',
  '3_meses':   'en los próximos 3 meses',
  'sin_prisa': 'sin fecha límite definida',
}

function buildPrompt(d: Record<string, unknown>): string {
  return `Eres el Agente Project Manager de devmark, una agencia de desarrollo de software en Guadalajara, México. Analiza este diagnóstico de cliente y genera una propuesta profesional completa y convincente.

DIAGNÓSTICO DEL CLIENTE:
- Negocio: ${d.business_name} (${d.business_type || 'tipo no especificado'})
- Contacto: ${d.contact_name || 'No especificado'} | Tel: ${d.contact_phone || 'N/A'} | Email: ${d.contact_email || 'N/A'}
- Tamaño: ${d.num_employees || 'no especificado'}
- Problema principal: ${d.main_problem}
- Objetivo deseado: ${d.main_objective || 'no especificado'}
- Situación digital actual: ${d.current_situation || 'no especificada'}
- Herramientas que usa hoy: ${d.current_tools || 'no especificadas'}
- Tipo de solución deseada: ${d.desired_solution || 'a definir'}
- Presupuesto: ${budgetMap[d.budget_range as string] ?? 'no definido'}
- Urgencia: ${urgencyMap[d.urgency as string] ?? 'sin prisa'}
- Tomador de decisión presente: ${d.decision_maker ? 'SÍ — puede cerrar hoy' : 'NO — necesita consultarlo'}
- Notas adicionales: ${d.extra_notes || 'ninguna'}

GENERA UNA PROPUESTA COMPLETA CON ESTE FORMATO EXACTO (JSON):
{
  "diagnostico_resumen": "Resumen del problema detectado en 2-3 oraciones",
  "solucion_propuesta": "Descripción de la solución en 3-5 oraciones",
  "stack_tecnologico": ["tecnología 1", "tecnología 2", "..."],
  "entregables": ["entregable 1", "entregable 2", "..."],
  "no_incluye": ["item 1", "item 2"],
  "costo_minimo": 0,
  "costo_maximo": 0,
  "costo_infraestructura_mensual": 0,
  "anticipo": 0,
  "timeline_semanas": 0,
  "fases": [
    {"semana": "1-2", "descripcion": "..."},
    {"semana": "3-4", "descripcion": "..."}
  ],
  "garantia_dias": 30,
  "notas_adicionales": "..."
}

REGLAS DE PRECIOS (MXN):
- Sitio web básico: $3,000–$8,000
- Sitio web con CMS/blog: $6,000–$15,000
- Sistema a medida simple: $15,000–$30,000
- Sistema a medida complejo: $30,000–$50,000
- Bot simple: $5,000–$12,000 | Bot con IA: $12,000–$25,000
- Dashboard: $8,000–$20,000
- Automatización: $3,000–$15,000
- Pago: 50% anticipo, 50% al entregar

RESPONDE EXCLUSIVAMENTE CON EL OBJETO JSON. PROHIBIDO incluir texto antes, después, explicaciones, comentarios ni bloques markdown. El primer carácter debe ser { y el último }.`
}

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
  const pmPrompt = buildPrompt(diag)

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
