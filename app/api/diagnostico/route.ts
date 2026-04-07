import pool from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { NextRequest, NextResponse } from 'next/server'

const CORE_API   = process.env.CORE_API_URL         ?? 'http://127.0.0.1:8000'
const API_SECRET = process.env.DASHBOARD_API_SECRET ?? ''

// GET — listar diagnósticos
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const url         = new URL(req.url)
  const prospectId  = url.searchParams.get('prospect_id')

  const query = prospectId
    ? 'SELECT * FROM diagnosticos WHERE prospect_id = $1 ORDER BY created_at DESC'
    : 'SELECT * FROM diagnosticos ORDER BY created_at DESC LIMIT 50'

  const params = prospectId ? [prospectId] : []
  const res    = await pool.query(query, params)
  return NextResponse.json({ diagnosticos: res.rows })
}

// POST — crear diagnóstico + generar propuesta con el PM
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Body inválido' }, { status: 400 })

  const {
    prospect_id,
    business_name,
    business_type,
    contact_name,
    contact_phone,
    contact_email,
    num_employees,
    main_problem,
    current_situation,
    current_tools,
    desired_solution,
    main_objective,
    budget_range,
    urgency,
    decision_maker,
    extra_notes,
  } = body

  if (!business_name || !main_problem) {
    return NextResponse.json({ error: 'business_name y main_problem son requeridos' }, { status: 400 })
  }

  // Guardar diagnóstico en BD
  const insertRes = await pool.query(
    `INSERT INTO diagnosticos
       (prospect_id, business_name, business_type, contact_name,
        contact_phone, contact_email, num_employees,
        main_problem, current_situation, current_tools,
        desired_solution, main_objective,
        budget_range, urgency, decision_maker, extra_notes, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'pendiente')
     RETURNING *`,
    [
      prospect_id ?? null, business_name, business_type ?? '', contact_name ?? '',
      contact_phone ?? '', contact_email ?? '', num_employees ?? '',
      main_problem, current_situation ?? '', current_tools ?? '',
      desired_solution ?? '', main_objective ?? '',
      budget_range ?? 'no_definido', urgency ?? 'sin_prisa',
      decision_maker ?? true, extra_notes ?? '',
    ]
  )
  const diagnostico = insertRes.rows[0]

  // Construir prompt estructurado para el PM
  const budgetMap: Record<string, string> = {
    'menos_5k':   'menos de $5,000 MXN',
    '5k_15k':     'entre $5,000 y $15,000 MXN',
    '15k_50k':    'entre $15,000 y $50,000 MXN',
    'mas_50k':    'más de $50,000 MXN',
    'no_definido': 'presupuesto no definido aún',
  }
  const urgencyMap: Record<string, string> = {
    'inmediata': 'urgente, lo antes posible',
    '1_mes':     'en el próximo mes',
    '3_meses':   'en los próximos 3 meses',
    'sin_prisa': 'sin fecha límite definida',
  }
  const solutionMap: Record<string, string> = {
    'sitio_web':     'Sitio web profesional',
    'sistema':       'Sistema a medida (software interno)',
    'bot':           'Bot de automatización o atención al cliente',
    'dashboard':     'Dashboard / panel de control',
    'automatizacion':'Automatización de procesos con scripts',
    'otro':          'Solución a definir',
  }

  const pmPrompt = `Eres el Agente Project Manager de devmark, una agencia de desarrollo de software en Guadalajara, México. Analiza este diagnóstico de cliente y genera una propuesta profesional completa y convincente.

DIAGNÓSTICO DEL CLIENTE:
- Negocio: ${business_name} (${business_type || 'tipo no especificado'})
- Contacto: ${contact_name || 'No especificado'} | Tel: ${contact_phone || 'N/A'} | Email: ${contact_email || 'N/A'}
- Tamaño: ${num_employees || 'no especificado'}
- Problema principal: ${main_problem}
- Objetivo deseado: ${main_objective || 'no especificado'}
- Situación digital actual: ${current_situation || 'no especificada'}
- Herramientas que usa hoy: ${current_tools || 'no especificadas'}
- Tipo de solución deseada: ${solutionMap[desired_solution] ?? desired_solution ?? 'a definir'}
- Presupuesto: ${budgetMap[budget_range] ?? 'no definido'}
- Urgencia: ${urgencyMap[urgency] ?? 'sin prisa'}
- Tomador de decisión presente: ${decision_maker ? 'SÍ — puede cerrar hoy' : 'NO — necesita consultarlo'}
- Notas adicionales: ${extra_notes || 'ninguna'}

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

REGLAS DE PRECIOS (MXN, toma en cuenta que el developer vive en Guadalajara, México, va empezando y tiene competencia):
- Sitio web básico (landing/institucional): $3,000–$8,000 + dominio ~$300/año + hosting ~$100/mes
- Sitio web con CMS/blog: $6,000–$15,000
- Sistema a medida simple: $15,000–$30,000
- Sistema a medida complejo: $30,000–$50,000
- Bot de WhatsApp/automatización simple: $5,000–$12,000
- Bot complejo con IA: $12,000–$25,000
- Dashboard/panel de control: $8,000–$20,000
- Automatización de procesos con scripts: $3,000–$15,000
- Pago: 50% anticipo, 50% al entregar
- Ajusta el precio según la complejidad real del caso

Responde ÚNICAMENTE con el JSON, sin markdown, sin explicaciones.`

  try {
    // Llamar al PM (agente id=2)
    const coreRes = await fetch(`${CORE_API}/agent/2/chat`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-secret': API_SECRET },
      body:    JSON.stringify({ message: pmPrompt }),
      signal:  AbortSignal.timeout(90_000),
    })

    if (!coreRes.ok) {
      await pool.query('UPDATE diagnosticos SET status=$1 WHERE id=$2', ['error', diagnostico.id])
      return NextResponse.json({ error: 'Error al generar propuesta', diagnostico }, { status: 502 })
    }

    const coreData  = await coreRes.json()
    const rawOutput = coreData.response ?? ''

    // Parsear JSON de la propuesta
    let propuesta: Record<string, unknown> | null = null
    try {
      const clean = rawOutput.trim()
      const start = clean.indexOf('{')
      const end   = clean.lastIndexOf('}') + 1
      if (start !== -1 && end > start) {
        propuesta = JSON.parse(clean.slice(start, end))
      }
    } catch {
      propuesta = null
    }

    // Guardar propuesta en BD
    await pool.query(
      'UPDATE diagnosticos SET propuesta=$1, raw_output=$2, status=$3 WHERE id=$4',
      [propuesta ? JSON.stringify(propuesta) : null, rawOutput, propuesta ? 'completado' : 'parcial', diagnostico.id]
    )

    return NextResponse.json({
      ok:         true,
      diagnostico: { ...diagnostico, propuesta, status: propuesta ? 'completado' : 'parcial' },
    })

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error de conexión'
    await pool.query('UPDATE diagnosticos SET status=$1 WHERE id=$2', ['error', diagnostico.id])
    return NextResponse.json({ error: msg, diagnostico }, { status: 503 })
  }
}
