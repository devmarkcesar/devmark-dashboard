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
    : 'SELECT * FROM diagnosticos ORDER BY created_at DESC LIMIT 200'

  const params = prospectId ? [prospectId] : []
  const res    = await pool.query(query, params)
  return NextResponse.json({ diagnosticos: res.rows })
}

// POST — crear diagnóstico + generar propuesta con el PM

export const budgetMap: Record<string, string> = {
  'menos_5k':    'menos de $5,000 MXN',
  '5k_15k':      'entre $5,000 y $15,000 MXN',
  '15k_50k':     'entre $15,000 y $50,000 MXN',
  'mas_50k':     'más de $50,000 MXN',
  'no_definido': 'presupuesto no definido aún',
}
export const urgencyMap: Record<string, string> = {
  'inmediata': 'urgente, lo antes posible',
  '1_mes':     'en el próximo mes',
  '3_meses':   'en los próximos 3 meses',
  'sin_prisa': 'sin fecha límite definida',
}
export const solutionMap: Record<string, string> = {
  'sitio_web':      'Sitio web profesional',
  'sistema':        'Sistema a medida (software interno)',
  'bot':            'Bot de automatización o atención al cliente',
  'dashboard':      'Dashboard / panel de control',
  'automatizacion': 'Automatización de procesos con scripts',
  'otro':           'Solución a definir',
}

// Construye el prompt del PM leyendo precios de pricing_catalog (BD)
export async function buildPmPrompt(ctx: Record<string, unknown>): Promise<string> {
  const solutionMap = ctx.solutionMap as Record<string, string>
  const budgetMap   = ctx.budgetMap as Record<string, string>
  const urgencyMap  = ctx.urgencyMap as Record<string, string>

  // Leer catálogo de precios activos de la BD
  const catalogRes = await pool.query(
    'SELECT categoria, concepto, tipo, precio_min, precio_max, notas FROM pricing_catalog WHERE activo = true ORDER BY categoria, id'
  )
  const rows = catalogRes.rows

  // Agrupar por categoría para construir el catálogo
  const grouped: Record<string, typeof rows> = {}
  for (const r of rows) {
    if (!grouped[r.categoria]) grouped[r.categoria] = []
    grouped[r.categoria].push(r)
  }

  const fmtPrice = (min: number, max: number) =>
    min === max ? `$${Number(min).toLocaleString()}` : `$${Number(min).toLocaleString()}–$${Number(max).toLocaleString()}`

  const catalogLines: string[] = []
  const catLabels: Record<string, string> = {
    desarrollo: 'DESARROLLO (cobro único)',
    dominio:    'DOMINIOS (anuales, proveedor: Hostinger — precio con margen devmark +10%)',
    hosting:    'HOSTING (mensual, proveedor: Hostinger — precio con margen devmark +10%)',
    soporte:    'SOPORTE TÉCNICO MENSUAL (post-entrega, opcional)',
    extra:      'CAMBIOS EXTRA POST-ENTREGA',
    seguridad:  'SEGURIDAD (incluido en todos los proyectos)',
  }

  for (const [cat, label] of Object.entries(catLabels)) {
    if (!grouped[cat]) continue
    catalogLines.push(`\n${label}:`)
    for (const r of grouped[cat]) {
      const price = r.tipo === 'incluido' ? 'INCLUIDO' : fmtPrice(r.precio_min, r.precio_max)
      const unit  = r.tipo === 'mensual' ? '/mes' : r.tipo === 'anual' ? '/año' : r.tipo === 'hora' ? '/hora' : ''
      const note  = r.notas ? ` (${r.notas})` : ''
      catalogLines.push(`- ${r.concepto}: ${price}${unit}${note}`)
    }
  }

  return `Eres el Agente Project Manager y Cotizador de devmark, una agencia de desarrollo de software en Guadalajara, México. Analiza este diagnóstico y genera una propuesta profesional con cotización detallada y desglosada.

DIAGNÓSTICO DEL CLIENTE:
- Negocio: ${ctx.business_name} (${ctx.business_type || 'tipo no especificado'})
- Contacto: ${ctx.contact_name || 'No especificado'} | Tel: ${ctx.contact_phone || 'N/A'} | Email: ${ctx.contact_email || 'N/A'}
- Tamaño: ${ctx.num_employees || 'no especificado'}
- Problema principal: ${ctx.main_problem}
- Objetivo deseado: ${ctx.main_objective || 'no especificado'}
- Situación digital actual: ${ctx.current_situation || 'no especificada'}
- Herramientas que usa hoy: ${Array.isArray(ctx.current_tools) ? (ctx.current_tools.length ? ctx.current_tools.join(', ') : 'ninguna') : ctx.current_tools || 'no especificadas'}
- Tipo de solución deseada: ${solutionMap[ctx.desired_solution as string] ?? ctx.desired_solution ?? 'a definir'}
- Presupuesto: ${budgetMap[ctx.budget_range as string] ?? 'no definido'}
- Urgencia: ${urgencyMap[ctx.urgency as string] ?? 'sin prisa'}
- Tomador de decisión presente: ${ctx.decision_maker ? 'SÍ — puede cerrar hoy' : 'NO — necesita consultarlo'}
- Notas adicionales: ${ctx.extra_notes || 'ninguna'}
- Integraciones externas requeridas: ${Array.isArray(ctx.integraciones_externas) ? (ctx.integraciones_externas.length ? (ctx.integraciones_externas as string[]).join(', ') : 'ninguna') : ctx.integraciones_externas || 'ninguna'}
- Requiere migración de datos: ${ctx.necesita_migracion ? `SÍ — ${ctx.migracion_detalle || 'sin detalle'}` : 'no'}
- Usuarios / roles: ${ctx.num_usuarios_roles || 'no especificado'}
- Cliente ya tiene dominio y hosting: ${ctx.tiene_dominio_hosting ? 'SÍ — NO incluir dominio en el desglose' : 'no'}
- Requiere factura (IVA): ${ctx.requiere_factura ? 'SÍ — incluir campos iva_incluido: false e iva_porcentaje: 16 en el JSON' : 'no'}

GENERA UNA PROPUESTA COMPLETA CON ESTE FORMATO EXACTO (JSON):
{
  "diagnostico_resumen": "Resumen del problema detectado en 2-3 oraciones",
  "solucion_propuesta": "Descripción de la solución en 3-5 oraciones",
  "factor_complejidad": "basico",
  "stack_tecnologico": ["tecnología 1", "tecnología 2"],
  "entregables": ["entregable 1", "entregable 2"],
  "no_incluye": ["item 1", "item 2"],
  "costo_minimo": 0,
  "costo_maximo": 0,
  "anticipo": 0,
  "costo_infraestructura_mensual": 0,
  "timeline_semanas": 0,
  "fases": [
    {"semana": "1-2", "descripcion": "..."}
  ],
  "garantia_dias": 30,
  "notas_adicionales": "...",
  "desglose_costos": [
    {"concepto": "Desarrollo del proyecto", "tipo": "unico", "monto_min": 0, "monto_max": 0},
    {"concepto": "Dominio .com (anual)", "tipo": "anual", "monto_min": 363, "monto_max": 363},
    {"concepto": "Hosting web compartido Business (mensual)", "tipo": "mensual", "monto_min": 65, "monto_max": 330},
    {"concepto": "Soporte técnico mensual (opcional)", "tipo": "opcional", "monto_min": 500, "monto_max": 500},
    {"concepto": "Certificado SSL", "tipo": "incluido", "monto_min": 0, "monto_max": 0},
    {"concepto": "Backups automáticos", "tipo": "incluido", "monto_min": 0, "monto_max": 0}
  ],
  "soporte_recomendado": "basico"
}

FACTOR DE COMPLEJIDAD — elige uno según el proyecto:
- "basico": solución simple, 1-2 módulos, stack estándar, sin integraciones complejas (landing page, sitio institucional, bot simple)
- "estandar": complejidad media, 3-4 módulos, alguna integración o lógica de negocio (ecommerce, sistema simple, dashboard)
- "premium": alta complejidad, 4+ módulos, integraciones múltiples, IA, arquitectura a medida (sistema complejo, app móvil, bot con IA)

=== CATÁLOGO DE PRECIOS REALES DEVMARK (MXN, ${new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).toUpperCase()}) ===${catalogLines.join('\n')}

LICENCIAS Y APIS (si aplican, cobro adicional):
- Google Maps API: desde $200 USD/mes según uso
- Twilio (SMS/WhatsApp): ~$0.05 USD por mensaje
- APIs de pago (Stripe/Conekta): sin costo fijo, comisión por transacción
- Si el proyecto NO requiere APIs de terceros, omitir esta sección

REGLAS PARA EL DESGLOSE:
1. "desglose_costos" DEBE incluir TODAS estas líneas (mínimo 5-7 conceptos):
   - SIEMPRE: desarrollo (único), dominio (anual), hosting recomendado (mensual)
   - SIEMPRE: soporte técnico recomendado con tipo "opcional" — el cliente decide si lo contrata
   - SIEMPRE: certificado SSL (tipo "incluido", monto 0) y backups automáticos (tipo "incluido", monto 0)
   - SI APLICA: licencias, APIs de terceros, migración de datos, capacitación
2. Cada línea: {"concepto": "texto", "tipo": "unico|mensual|anual|incluido|opcional", "monto_min": N, "monto_max": N}
3. Para tipo "incluido": monto_min y monto_max = 0 (se muestra como "Incluido" al cliente)
4. Para tipo "opcional": se muestra como "Opcional" — es una recomendación, NO un cargo obligatorio
5. "costo_minimo" y "costo_maximo" = solo el desarrollo (cobro único)
6. "costo_infraestructura_mensual" = solo hosting + costos mensual obligatorios (NO incluye soporte porque es opcional)
7. "anticipo" = 50% de costo_minimo
8. "soporte_recomendado" = "basico", "estandar" o "premium" según complejidad del proyecto
9. "factor_complejidad" = "basico", "estandar" o "premium" según la evaluación del proyecto
10. Recomienda hosting según la necesidad REAL: compartido Single/Premium para sitios simples, Business para múltiples sitios, VPS para sistemas con backend
11. REGLA VPS: Si el proyecto es un sistema, bot, dashboard o requiere backend propio (API REST, Node.js, Python, FastAPI), USA VPS obligatoriamente — no hosting compartido
12. REGLA DOMINIO: Si el cliente YA TIENE dominio y hosting, NO incluir dominio ni hosting en el desglose
13. Ajusta precios según complejidad real del caso, no inventes — usa el catálogo
12. El desglose debe darle al cliente una visión COMPLETA: costos fijos + recurrentes + incluidos + opcionales

RESPONDE EXCLUSIVAMENTE CON EL OBJETO JSON. PROHIBIDO incluir texto antes, después, explicaciones, comentarios ni bloques markdown. El primer carácter debe ser { y el último }.`
}

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
    integraciones_externas,
    necesita_migracion,
    migracion_detalle,
    num_usuarios_roles,
    tiene_dominio_hosting,
    precio_acordado,
    requiere_factura,
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
        budget_range, urgency, decision_maker, extra_notes,
        integraciones_externas, necesita_migracion, migracion_detalle,
        num_usuarios_roles, tiene_dominio_hosting, precio_acordado, requiere_factura,
        status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,'pendiente')
     RETURNING *`,
    [
      prospect_id ?? null, business_name, business_type ?? '', contact_name ?? '',
      contact_phone ?? '', contact_email ?? '', num_employees ?? '',
      main_problem, current_situation ?? '', current_tools ?? '',
      desired_solution ?? '', main_objective ?? '',
      budget_range ?? 'no_definido', urgency ?? 'sin_prisa',
      decision_maker ?? true, extra_notes ?? '',
      integraciones_externas ?? null, necesita_migracion ?? false, migracion_detalle ?? '',
      num_usuarios_roles ?? '', tiene_dominio_hosting ?? false, precio_acordado ?? null, requiere_factura ?? false,
    ]
  )
  const diagnostico = insertRes.rows[0]

  // Construir prompt estructurado para el PM
  const pmPrompt = await buildPmPrompt({
    business_name, business_type, contact_name, contact_phone, contact_email,
    num_employees, main_problem, main_objective, current_situation, current_tools,
    desired_solution, budget_range, urgency, decision_maker, extra_notes,
    integraciones_externas, necesita_migracion, migracion_detalle,
    num_usuarios_roles, tiene_dominio_hosting, requiere_factura,
    solutionMap, budgetMap, urgencyMap,
  })

  // Extrae el primer JSON válido de un string (maneja markdown, texto extra, etc.)
  function extractJSON(raw: string): Record<string, unknown> | null {
    const text = raw.trim()
    // Intentar parse directo
    try { return JSON.parse(text) } catch { /* continuar */ }
    // Extraer primer bloque ```json ... ``` o ``` ... ```
    const mdMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (mdMatch) {
      try { return JSON.parse(mdMatch[1].trim()) } catch { /* continuar */ }
    }
    // Extraer desde primer { hasta último }
    const start = text.indexOf('{')
    const end   = text.lastIndexOf('}')
    if (start !== -1 && end > start) {
      try { return JSON.parse(text.slice(start, end + 1)) } catch { /* continuar */ }
    }
    return null
  }

  try {
    // Llamar al PM (agente id=2) — primer intento usando endpoint /raw (sin formato markdown)
    const coreRes = await fetch(`${CORE_API}/agent/2/raw`, {
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
    let   rawOutput = coreData.response ?? ''
    let   propuesta = extractJSON(rawOutput)

    // Si falló, reintentar con prompt de recuperación
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
      } catch { /* si falla el retry, usamos lo que tenemos */ }
    }

    // Guardar propuesta en BD (separado del try principal para no perder el resultado)
    try {
      await pool.query(
        'UPDATE diagnosticos SET propuesta=$1, raw_output=$2, status=$3 WHERE id=$4',
        [propuesta ? JSON.stringify(propuesta) : null, rawOutput, propuesta ? 'completado' : 'parcial', diagnostico.id]
      )
    } catch (updateErr) {
      console.error('Error al actualizar diagnóstico:', updateErr)
    }

    return NextResponse.json({
      ok:          true,
      diagnostico: { ...diagnostico, propuesta, status: propuesta ? 'completado' : 'parcial' },
    })

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error de conexión'
    try {
      await pool.query('UPDATE diagnosticos SET status=$1 WHERE id=$2', ['error', diagnostico.id])
    } catch { /* ignorar */ }
    return NextResponse.json({ error: msg, diagnostico }, { status: 503 })
  }
}
