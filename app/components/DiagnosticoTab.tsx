'use client'
import { useState, useEffect, useCallback } from 'react'
import { T } from './tokens'
import type { Prospect } from './types'
import { ProspuestaView, type Propuesta } from './ProspuestaView'

const INDUSTRIES = [
  'Restaurante / Cafetería', 'Taquería / Fonda', 'Ferretería / Tlapalería',
  'Tienda de abarrotes', 'Boutique / Ropa', 'Salón de belleza / Barbería',
  'Contaduría / Despacho fiscal', 'Despacho jurídico', 'Clínica / Consultorio',
  'Gimnasio / Spa', 'Agencia de marketing', 'Constructora / Inmobiliaria',
  'Escuela / Academia', 'Taller mecánico', 'Farmacia', 'Otro',
]

const EMPLOYEES_OPTIONS = [
  { value: 'solo',   label: 'Solo el dueño' },
  { value: '2_5',    label: '2 – 5 empleados' },
  { value: '6_15',   label: '6 – 15 empleados' },
  { value: '16_50',  label: '16 – 50 empleados' },
  { value: 'mas_50', label: 'Más de 50 empleados' },
]

const CURRENT_TOOLS = [
  { value: 'papel',    label: '📄 Papel / libreta' },
  { value: 'excel',    label: '📊 Excel / Google Sheets' },
  { value: 'whatsapp', label: '💬 WhatsApp (grupos/notas)' },
  { value: 'pos',      label: '🖥 Sistema POS / caja' },
  { value: 'sistema',  label: '⚙️ Sistema propio (desactualizado)' },
  { value: 'nada',     label: '❌ Sin herramientas digitales' },
]

const SITUATION_OPTIONS = [
  { value: 'nada',          label: 'No tiene nada digital' },
  { value: 'tiene_web',     label: 'Tiene sitio web pero está desactualizado o no funciona bien' },
  { value: 'tiene_sistema', label: 'Tiene un sistema pero necesita mejoras' },
  { value: 'tiene_bot',     label: 'Tiene un bot/automatización pero falla o es limitado' },
]

const SOLUTION_OPTIONS = [
  { value: 'sitio_web',      label: '🌐 Sitio web profesional' },
  { value: 'sistema',        label: '⚙️ Sistema a medida (inventario, ventas, citas...)' },
  { value: 'bot',            label: '🤖 Bot de WhatsApp / atención al cliente' },
  { value: 'dashboard',      label: '📊 Dashboard / panel de control' },
  { value: 'automatizacion', label: '⚡ Automatización de procesos internos' },
  { value: 'otro',           label: '💡 No sé, necesito orientación' },
]

const BUDGET_OPTIONS = [
  { value: 'menos_5k',    label: 'Menos de $5,000 MXN' },
  { value: '5k_15k',      label: '$5,000 – $15,000 MXN' },
  { value: '15k_50k',     label: '$15,000 – $50,000 MXN' },
  { value: 'mas_50k',     label: 'Más de $50,000 MXN' },
  { value: 'no_definido', label: 'No lo tengo definido aún' },
]

const URGENCY_OPTIONS = [
  { value: 'inmediata', label: 'Lo antes posible' },
  { value: '1_mes',     label: 'En el próximo mes' },
  { value: '3_meses',   label: 'En los próximos 3 meses' },
  { value: 'sin_prisa', label: 'Sin fecha límite definida' },
]

const INTEGRACIONES_OPTIONS = [
  { value: 'whatsapp_api',   label: '📱 WhatsApp Business API' },
  { value: 'pasarela_pago',  label: '💳 Pasarela de pago (Stripe/Conekta)' },
  { value: 'sat_facturacion',label: '🧾 SAT / Facturación electrónica' },
  { value: 'google_maps',    label: '🗺 Google Maps' },
  { value: 'ninguna',        label: '❌ Ninguna' },
]

interface DiagnosticoRecord {
  id:                number
  public_token:      string
  business_name:     string
  business_type:     string
  contact_name:      string
  contact_phone:     string
  contact_email:     string
  num_employees:     string
  main_problem:      string
  current_situation: string
  current_tools:     string
  desired_solution:  string
  main_objective:    string
  budget_range:      string
  urgency:           string
  decision_maker:    boolean
  extra_notes:       string
  integraciones_externas: string | string[] | null
  necesita_migracion:     boolean
  migracion_detalle:      string
  num_usuarios_roles:     string
  tiene_dominio_hosting:  boolean
  precio_acordado:        number | null
  requiere_factura:       boolean
  status:            string
  propuesta:         Propuesta | null
  raw_output:        string
  created_at:        string
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: T.navy }}>{label}</label>
      {children}
    </div>
  )
}



const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', fontSize: 13, color: T.carbon,
  border: `1.5px solid ${T.cardBorder}`, borderRadius: 8, outline: 'none',
  background: '#FAFAFA', boxSizing: 'border-box',
}

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  completado: { bg: 'rgba(29,158,117,0.12)', color: '#1D9E75', label: 'Completado' },
  parcial:    { bg: 'rgba(246,201,14,0.15)', color: '#9A7C00', label: 'Sin estructurar' },
  error:      { bg: 'rgba(192,86,33,0.10)',  color: '#C05621', label: 'Error' },
  pendiente:  { bg: 'rgba(100,100,100,0.10)',color: '#666',    label: 'Pendiente' },
  borrador:   { bg: 'rgba(234,179,8,0.15)',  color: '#B45309', label: 'Borrador' },
  aprobada:   { bg: 'rgba(29,158,117,0.12)', color: '#1D9E75', label: 'Aprobada' },
  enviada:    { bg: 'rgba(24,95,165,0.12)',  color: '#185FA5', label: 'Enviada'  },
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40)
}

function isRateLimit(raw: string): { limited: boolean; retryIn: string } {
  if (!raw || (!raw.includes('429') && !raw.includes('rate_limit_exceeded'))) return { limited: false, retryIn: '' }
  const match = raw.match(/try again in ([^\s"]+)/i)
  return { limited: true, retryIn: match?.[1] ?? '' }
}

export function DiagnosticoTab({ prospects = [] }: { prospects?: Prospect[] }) {
  const [step, setStep]               = useState<'form' | 'loading' | 'result' | 'historial' | 'historial-detail'>('form')
  const [error, setError]             = useState<string | null>(null)
  const [propuesta, setPropuesta]     = useState<Propuesta | null>(null)
  const [rawOutput, setRawOutput]     = useState('')
  const [historial, setHistorial]     = useState<DiagnosticoRecord[]>([])
  const [histLoading, setHistLoading] = useState(false)
  const [selected, setSelected]       = useState<DiagnosticoRecord | null>(null)
  const [currentName, setCurrentName] = useState('')
  const [currentToken, setCurrentToken] = useState('')
  const [regenLoading, setRegenLoading] = useState(false)
  const [regenError, setRegenError]     = useState<string | null>(null)
  const [multiLoading,   setMultiLoading]   = useState(false)
  const [multiError,     setMultiError]     = useState<string | null>(null)
  const [aprobarLoading, setAprobarLoading] = useState(false)
  const [editingFrom, setEditingFrom]   = useState<DiagnosticoRecord | null>(null)
  const [histSearch,  setHistSearch]    = useState('')
  const [histPage,    setHistPage]      = useState(1)
  const HIST_PER_PAGE = 20

  const [selectedProspectId, setSelectedProspectId] = useState<number | null>(null)

  const [form, setForm] = useState({
    business_name:     '',
    business_type:     '',
    contact_name:      '',
    contact_phone:     '',
    contact_email:     '',
    num_employees:     '',
    main_problem:      '',
    current_situation: [] as string[],
    current_tools:     [] as string[],
    desired_solution:  [] as string[],
    main_objective:    '',
    budget_range:      'no_definido',
    urgency:           'sin_prisa',
    decision_maker:    true,
    extra_notes:       '',
    integraciones_externas: [] as string[],
    necesita_migracion:     false,
    migracion_detalle:      '',
    num_usuarios_roles:     '',
    tiene_dominio_hosting:  false,
    precio_acordado:        '',
    requiere_factura:       false,
  })

  function update(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  const loadHistorial = useCallback(async () => {
    setHistLoading(true)
    try {
      const res = await fetch('/api/diagnostico')
      if (res.ok) {
        const data = await res.json()
        setHistorial(data.diagnosticos ?? [])
      }
    } catch { /* silencioso */ }
    setHistLoading(false)
  }, [])

  useEffect(() => { loadHistorial() }, [loadHistorial])

  // Scroll al inicio cada vez que cambia la vista interna
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [step])

  async function deleteDiagnostico(id: number) {
    if (!confirm('¿Eliminar este diagnóstico? Esta acción no se puede deshacer.')) return
    await fetch(`/api/diagnostico/${id}`, { method: 'DELETE' })
    setHistorial(prev => prev.filter(d => d.id !== id))
    setStep('historial')
    setSelected(null)
  }

  async function regenerarDiagnostico(d: DiagnosticoRecord) {
    setRegenLoading(true)
    setRegenError(null)
    try {
      const res  = await fetch(`/api/diagnostico/${d.id}`, { method: 'PATCH' })
      const data = await res.json()
      if (res.status === 429 || data.rateLimit) {
        setRegenError(data.error ?? 'Límite de tokens de Groq alcanzado. Espera unos minutos e inténtalo de nuevo.')
      } else if (data.ok) {
        const updated = data.diagnostico
        setSelected(updated)
        setHistorial(prev => prev.map(x => x.id === d.id ? { ...x, ...updated } : x))
      } else {
        setRegenError(data.error ?? 'Error al regenerar la propuesta.')
      }
    } catch { setRegenError('Sin conexión al servidor.') }
    setRegenLoading(false)
  }

  async function generarMultiAgente(d: DiagnosticoRecord) {
    setMultiLoading(true)
    setMultiError(null)
    try {
      const res  = await fetch(`/api/diagnostico/${d.id}/propuesta-multi`, { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        const updated = { ...d, propuesta: data.propuesta, status: 'borrador' }
        setSelected(updated)
        setHistorial(prev => prev.map(x => x.id === d.id ? updated : x))
      } else {
        setMultiError(data.error ?? 'Error al generar la propuesta multi-agente.')
      }
    } catch { setMultiError('Sin conexión al servidor.') }
    setMultiLoading(false)
  }

  async function aprobarPropuesta(d: DiagnosticoRecord) {
    if (!confirm('¿Aprobar esta propuesta? Ya no podrás editarla.')) return
    setAprobarLoading(true)
    try {
      const res  = await fetch(`/api/diagnostico/${d.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ aprobar: true }),
      })
      const data = await res.json()
      if (data.ok) {
        const updated = { ...d, status: 'aprobada' }
        setSelected(updated)
        setHistorial(prev => prev.map(x => x.id === d.id ? updated : x))
      }
    } catch { /* silencioso */ }
    setAprobarLoading(false)
  }

  function editarDiagnostico(d: DiagnosticoRecord) {
    setForm({
      business_name:     d.business_name     || '',
      business_type:     d.business_type     || '',
      contact_name:      d.contact_name      || '',
      contact_phone:     d.contact_phone     || '',
      contact_email:     d.contact_email     || '',
      num_employees:     d.num_employees     || '',
      main_problem:      d.main_problem      || '',
      current_situation: d.current_situation ? d.current_situation.split(', ').filter(Boolean) : [],
      current_tools:     d.current_tools     ? d.current_tools.split(', ').filter(Boolean)     : [],
      desired_solution:  d.desired_solution  ? d.desired_solution.split(', ').filter(Boolean)  : [],
      main_objective:    d.main_objective    || '',
      budget_range:      d.budget_range      || 'no_definido',
      urgency:           d.urgency           || 'sin_prisa',
      decision_maker:    d.decision_maker    ?? true,
      extra_notes:       d.extra_notes       || '',
      integraciones_externas: d.integraciones_externas
        ? (Array.isArray(d.integraciones_externas) ? d.integraciones_externas : (d.integraciones_externas as string).split(', ').filter(Boolean))
        : [],
      necesita_migracion:    d.necesita_migracion    ?? false,
      migracion_detalle:     d.migracion_detalle     || '',
      num_usuarios_roles:    d.num_usuarios_roles    || '',
      tiene_dominio_hosting: d.tiene_dominio_hosting ?? false,
      precio_acordado:       d.precio_acordado != null ? String(d.precio_acordado) : '',
      requiere_factura:      d.requiere_factura       ?? false,
    })
    setPropuesta(null)
    setRawOutput('')
    setError(null)
    setEditingFrom(d)   // guardamos de dónde venimos
    setStep('form')
  }

  function toggleMulti(field: 'current_situation' | 'current_tools' | 'desired_solution' | 'integraciones_externas', value: string) {
    setForm(f => {
      const arr = f[field] as string[]
      return { ...f, [field]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] }
    })
  }

  async function handleSubmit() {
    if (!form.business_name.trim() || !form.main_problem.trim() || !form.contact_name.trim()) {
      setError('Nombre del negocio, contacto y problema principal son obligatorios.')
      return
    }
    if (form.contact_phone && !/^[\d\s\-\+\(\)]{7,20}$/.test(form.contact_phone.trim())) {
      setError('El teléfono no parece válido. Ej: 33 1234 5678')
      return
    }
    if (form.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email.trim())) {
      setError('El email no parece válido. Ej: juan@negocio.com')
      return
    }
    setError(null)
    setStep('loading')
    setCurrentName(form.business_name)

    try {
      const res = await fetch('/api/diagnostico', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...form,
          prospect_id:       selectedProspectId ?? undefined,
          current_situation: form.current_situation.join(', '),
          current_tools:     form.current_tools.join(', '),
          desired_solution:  form.desired_solution.join(', '),
          integraciones_externas: form.integraciones_externas.length ? form.integraciones_externas : undefined,
          necesita_migracion:     form.necesita_migracion,
          migracion_detalle:      form.migracion_detalle || undefined,
          num_usuarios_roles:     form.num_usuarios_roles || undefined,
          tiene_dominio_hosting:  form.tiene_dominio_hosting,
          precio_acordado:        form.precio_acordado ? parseFloat(form.precio_acordado) : undefined,
          requiere_factura:       form.requiere_factura,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al generar propuesta')
        setStep('form')
        return
      }

      setPropuesta(data.diagnostico.propuesta ?? null)
      setRawOutput(data.diagnostico.raw_output ?? '')
      setCurrentToken(data.diagnostico.public_token ?? '')
      setStep('result')
      loadHistorial() // refrescar historial en segundo plano
    } catch {
      setError('Sin conexión al servidor')
      setStep('form')
    }
  }

  function handleReset() {
    setStep('form')
    setPropuesta(null)
    setRawOutput('')
    setError(null)
    setEditingFrom(null)
    setSelectedProspectId(null)
    setForm({
      business_name: '', business_type: '', contact_name: '',
      contact_phone: '', contact_email: '', num_employees: '',
      main_problem: '', current_situation: [], current_tools: [],
      desired_solution: [], main_objective: '',
      budget_range: 'no_definido', urgency: 'sin_prisa',
      decision_maker: true, extra_notes: '',
      integraciones_externas: [], necesita_migracion: false, migracion_detalle: '',
      num_usuarios_roles: '', tiene_dominio_hosting: false, precio_acordado: '', requiere_factura: false,
    })
  }

  function downloadQuestionnaire() {
    const today = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
    const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><title>Cuestionario de Diagnóstico - devmark</title>
<style>
  @page { size: A4; margin: 2cm 2.5cm; }
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #222; line-height: 1.5; }
  .header-bar { background: #0C2D4E; color: #fff; padding: 18px 24px; }
  .header-bar h1 { font-size: 20pt; font-weight: bold; margin: 0 0 2px; }
  .header-bar p { font-size: 9pt; margin: 0; opacity: 0.75; }
  .teal-bar { background: #1D9E75; height: 5px; margin-bottom: 22px; }
  .meta-row { display: flex; gap: 32px; margin-bottom: 18px; padding: 10px 14px; background: #F1EFE8; border-left: 4px solid #185FA5; }
  .meta-item { flex: 1; }
  .meta-item label { font-size: 8pt; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 4px; }
  .meta-item .line { border-bottom: 1.5px solid #999; height: 20px; }
  .nota { background: #FFF8E7; border-left: 4px solid #F6C90E; padding: 8px 12px; font-size: 9pt; color: #7A5C00; margin-bottom: 20px; }
  .section { margin-bottom: 22px; page-break-inside: avoid; }
  .section-title { background: #0C2D4E; color: #fff; padding: 7px 14px; font-size: 10pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }
  .row2 { display: flex; gap: 24px; }
  .row2 > * { flex: 1; }
  .field { margin-bottom: 12px; }
  .field label { font-size: 9pt; font-weight: bold; color: #185FA5; display: block; margin-bottom: 4px; }
  .line-s { border-bottom: 1px solid #aaa; height: 22px; width: 100%; }
  .line-m { border: 1px solid #ccc; height: 54px; width: 100%; margin-bottom: 6px; }
  .options { display: flex; flex-wrap: wrap; gap: 4px 22px; margin-top: 4px; }
  .option, .chk { font-size: 10pt; color: #333; min-width: 170px; }
  .footer { margin-top: 28px; padding-top: 12px; border-top: 2px solid #1D9E75; display: flex; justify-content: space-between; align-items: flex-end; }
  .footer-brand { font-size: 15pt; font-weight: bold; color: #0C2D4E; }
  .footer-info { font-size: 8pt; color: #888; text-align: right; }
</style></head>
<body>
<div class="header-bar"><h1>devmark</h1><p>Cuestionario de Diagnóstico Digital — Visita a cliente</p></div>
<div class="teal-bar"></div>
<div class="meta-row">
  <div class="meta-item"><label>Fecha de visita</label><div class="line">&nbsp;</div></div>
  <div class="meta-item"><label>Consultor devmark</label><div class="line">&nbsp;</div></div>
  <div class="meta-item"><label>Folio interno</label><div class="line">&nbsp;</div></div>
</div>
<div class="nota">📋 <strong>Instrucciones:</strong> Completa este cuestionario durante la visita al cliente. Al terminar, ingresa los datos en <strong>app.devmark.mx → Diagnóstico de cliente</strong> para generar la propuesta automáticamente.</div>

<div class="section">
  <div class="section-title">1 · Datos del negocio</div>
  <div class="field"><label>Nombre del negocio *</label><div class="line-s"></div></div>
  <div class="row2">
    <div class="field"><label>Nombre del contacto *</label><div class="line-s"></div></div>
    <div class="field"><label>Cargo / Puesto</label><div class="line-s"></div></div>
  </div>
  <div class="row2">
    <div class="field"><label>Teléfono / WhatsApp *</label><div class="line-s"></div></div>
    <div class="field"><label>Email (opcional)</label><div class="line-s"></div></div>
  </div>
  <div class="row2">
    <div class="field"><label>Industria / Giro del negocio</label>
      <div class="options" style="flex-direction:column; gap:3px;">
        <div class="option">☐ Restaurante / Cafetería</div><div class="option">☐ Taquería / Fonda</div>
        <div class="option">☐ Ferretería / Tlapalería</div><div class="option">☐ Tienda de abarrotes</div>
        <div class="option">☐ Boutique / Ropa</div><div class="option">☐ Salón de belleza / Barbería</div>
        <div class="option">☐ Contaduría / Despacho fiscal</div><div class="option">☐ Despacho jurídico</div>
        <div class="option">☐ Clínica / Consultorio</div><div class="option">☐ Gimnasio / Spa</div>
        <div class="option">☐ Constructora / Inmobiliaria</div><div class="option">☐ Escuela / Academia</div>
        <div class="option">☐ Taller mecánico</div><div class="option">☐ Farmacia</div>
        <div class="option">☐ Otro: ______________________</div>
      </div>
    </div>
    <div class="field"><label>Tamaño del negocio</label>
      <div class="options" style="flex-direction:column; gap:4px;">
        <div class="option">☐ Solo el dueño</div><div class="option">☐ 2 – 5 empleados</div>
        <div class="option">☐ 6 – 15 empleados</div><div class="option">☐ 16 – 50 empleados</div>
        <div class="option">☐ Más de 50 empleados</div>
      </div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">2 · Situación actual del negocio</div>
  <div class="field"><label>¿Cuál es el problema o necesidad principal? *</label>
    <div class="line-m"></div><div class="line-m"></div>
  </div>
  <div class="field"><label>Presencia digital actual</label>
    <div class="options" style="flex-direction:column; gap:3px;">
      <div class="option">☐ No tiene nada digital</div>
      <div class="option">☐ Tiene sitio web pero está desactualizado o no funciona bien</div>
      <div class="option">☐ Tiene un sistema pero necesita mejoras</div>
      <div class="option">☐ Tiene un bot/automatización pero falla o es limitado</div>
    </div>
  </div>
  <div class="field"><label>Herramientas que usa actualmente (marcar todas las que apliquen)</label>
    <div class="options">
      <div class="chk">☐ Papel / libreta</div><div class="chk">☐ Excel / Google Sheets</div>
      <div class="chk">☐ WhatsApp (grupos/notas)</div><div class="chk">☐ Sistema POS / caja</div>
      <div class="chk">☐ Sistema propio (desactualizado)</div><div class="chk">☐ Sin herramientas digitales</div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">3 · Solución deseada</div>
  <div class="field"><label>Tipo de solución que busca</label>
    <div class="options">
      <div class="option">☐ Sitio web profesional</div>
      <div class="option">☐ Sistema a medida (inventario, ventas, citas…)</div>
      <div class="option">☐ Bot de WhatsApp / atención al cliente</div>
      <div class="option">☐ Dashboard / panel de control</div>
      <div class="option">☐ Automatización de procesos internos</div>
      <div class="option">☐ No sé, necesita orientación</div>
    </div>
  </div>
  <div class="field"><label>¿Qué quiere lograr con esta solución? (objetivo concreto)</label>
    <div class="line-m"></div>
  </div>
  <div class="field"><label>¿Alguna integración o sistema existente al que deba conectarse?</label>
    <div class="line-s"></div>
  </div>
</div>

<div class="section">
  <div class="section-title">4 · Información comercial</div>
  <div class="row2">
    <div class="field"><label>Presupuesto aproximado</label>
      <div class="options" style="flex-direction:column; gap:3px;">
        <div class="option">☐ Menos de $5,000 MXN</div><div class="option">☐ $5,000 – $15,000 MXN</div>
        <div class="option">☐ $15,000 – $50,000 MXN</div><div class="option">☐ Más de $50,000 MXN</div>
        <div class="option">☐ No definido aún</div>
      </div>
    </div>
    <div class="field"><label>Urgencia del proyecto</label>
      <div class="options" style="flex-direction:column; gap:3px;">
        <div class="option">☐ Lo antes posible</div><div class="option">☐ En el próximo mes</div>
        <div class="option">☐ En los próximos 3 meses</div><div class="option">☐ Sin fecha límite definida</div>
      </div>
    </div>
  </div>
  <div class="field"><label>¿Está presente quien toma la decisión de compra?</label>
    <div class="options" style="gap:24px;">
      <div class="option">☐ Sí — puede decidir hoy</div>
      <div class="option">☐ No — necesita consultarlo</div>
    </div>
    <div style="margin-top:6px; font-size:9pt; color:#555;">Si NO: ¿Con quién consulta? / ¿Cuándo puede dar respuesta? <div class="line-s"></div></div>
  </div>
  <div class="field"><label>Notas adicionales / observaciones del consultor</label>
    <div class="line-m"></div><div class="line-m"></div>
  </div>
</div>

<div class="footer">
  <div>
    <div class="footer-brand">devmark</div>
    <div style="font-size:8pt; color:#888;">devmark.mx · Guadalajara, Jalisco, México</div>
  </div>
  <div class="footer-info">Cuestionario generado: ${today}<br>Ingresar en: app.devmark.mx → Diagnóstico de cliente</div>
</div>
</body></html>`

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cuestionario-diagnostico-devmark.doc'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 48px', fontFamily: 'inherit' }}>

      {/* Header */}
      <div className="diagnostico-header" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: T.navy, margin: '0 0 4px' }}>Diagnóstico de cliente</h1>
            <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>
              Completa el formulario con las necesidades del cliente. Los agentes generarán una propuesta completa al instante.
            </p>
          </div>
          <button onClick={downloadQuestionnaire} title="Descargar cuestionario en Word para llevar a la visita" style={{
            display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
            background: '#fff', color: T.navy, border: `1.5px solid ${T.cardBorder}`,
            borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}>
            <span style={{ fontSize: 15 }}>📋</span> Cuestionario (.doc)
          </button>
          {(step === 'form' || step === 'result') && (
            <button
              onClick={() => { loadHistorial(); setStep('historial') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
                background: '#fff', color: T.navy,
                border: `1.5px solid ${T.cardBorder}`,
                borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>
              <span style={{ fontSize: 15 }}>🗂</span>
              Historial {historial.length > 0 && `(${historial.length})`}
            </button>
          )}
        </div>
      </div>

      {step === 'form' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {editingFrom && (
            <button
              onClick={() => { setStep('historial-detail'); setEditingFrom(null) }}
              style={{
                alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', color: T.textMuted,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
              }}
            >
              ← Cancelar y volver al historial
            </button>
          )}
          {error && (
            <div style={{ background: '#FEF3F0', border: '1px solid #F8C4B4', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#C05621' }}>
              {error}
            </div>
          )}

          {/* ── SECCIÓN 1: Datos del negocio ── */}
          <div style={{ background: '#fff', border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>1 · Datos del negocio</p>

            {/* Selector de prospecto del CRM */}
            {prospects.length > 0 && (
              <Field label="Vincular a prospecto del CRM (opcional)">
                <select
                  value={selectedProspectId ?? ''}
                  onChange={e => {
                    const id = e.target.value ? Number(e.target.value) : null
                    setSelectedProspectId(id)
                    if (id) {
                      const p = prospects.find(pr => pr.id === id)
                      if (p) {
                        update('business_name',  p.business_name  || form.business_name)
                        update('business_type',  p.business_type  || form.business_type)
                        update('contact_name',   p.contact_name   || form.contact_name)
                        update('contact_phone',  p.phone          || form.contact_phone)
                        update('contact_email',  p.email          || form.contact_email)
                      }
                    }
                  }}
                  style={{ ...inputStyle, color: selectedProspectId ? T.navy : T.textMuted }}
                >
                  <option value="">— Sin vincular —</option>
                  {prospects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.business_name} · {p.contact_name}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <Field label="Nombre del negocio *">
                <input value={form.business_name} onChange={e => update('business_name', e.target.value)}
                  placeholder="Ej: Tacos El Güero" style={inputStyle} />
              </Field>
              <Field label="Industria / Giro">
                <select value={form.business_type} onChange={e => update('business_type', e.target.value)} style={inputStyle}>
                  <option value="">Selecciona una opción</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <Field label="Nombre del contacto *">
                <input value={form.contact_name} onChange={e => update('contact_name', e.target.value)}
                  placeholder="Ej: Juan López" style={inputStyle} />
              </Field>
              <Field label="Teléfono / WhatsApp *">
                <input value={form.contact_phone} onChange={e => update('contact_phone', e.target.value)}
                  placeholder="Ej: 33 1234 5678" style={inputStyle} type="tel" />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <Field label="Email (opcional)">
                <input value={form.contact_email} onChange={e => update('contact_email', e.target.value)}
                  placeholder="Ej: juan@negocio.com" style={inputStyle} type="email" />
              </Field>
              <Field label="Tamaño del negocio">
                <select value={form.num_employees} onChange={e => update('num_employees', e.target.value)} style={inputStyle}>
                  <option value="">Selecciona una opción</option>
                  {EMPLOYEES_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* ── SECCIÓN 2: Situación actual ── */}
          <div style={{ background: '#fff', border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>2 · Situación actual del negocio</p>

            <Field label="¿Cuál es el problema o necesidad principal? *">
              <textarea value={form.main_problem} onChange={e => update('main_problem', e.target.value)}
                placeholder="Ej: No tienen sistema para llevar el inventario, lo hacen en papel y constantemente se les acaban ingredientes sin darse cuenta..."
                rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>

            <Field label="Presencia digital actual (puede seleccionar varias)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {SITUATION_OPTIONS.map(opt => (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox"
                      checked={form.current_situation.includes(opt.value)}
                      onChange={() => toggleMulti('current_situation', opt.value)}
                      style={{ accentColor: T.navy }} />
                    <span style={{ fontSize: 13, color: T.carbon }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </Field>

            <Field label="¿Qué herramientas usa actualmente? (selecciona todas las que apliquen)">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                {CURRENT_TOOLS.map(opt => (
                  <label key={opt.value} style={{
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    padding: '7px 12px', borderRadius: 8, border: '1.5px solid',
                    borderColor: form.current_tools.includes(opt.value) ? T.teal : T.cardBorder,
                    background: form.current_tools.includes(opt.value) ? 'rgba(29,158,117,0.06)' : '#fff',
                    transition: 'all 0.12s',
                  }}>
                    <input type="checkbox" checked={form.current_tools.includes(opt.value)}
                      onChange={() => toggleMulti('current_tools', opt.value)}
                      style={{ accentColor: T.teal }} />
                    <span style={{ fontSize: 12, color: T.carbon }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </Field>
          </div>

          {/* ── SECCIÓN 3: Solución y objetivos ── */}
          <div style={{ background: '#fff', border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>3 · Solución deseada</p>

            <Field label="¿Qué tipo de solución busca? (puede seleccionar varias)">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                {SOLUTION_OPTIONS.map(opt => (
                  <label key={opt.value} style={{
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    padding: '8px 12px', borderRadius: 8, border: '1.5px solid',
                    borderColor: form.desired_solution.includes(opt.value) ? T.blue : T.cardBorder,
                    background: form.desired_solution.includes(opt.value) ? 'rgba(24,95,165,0.06)' : '#fff',
                    transition: 'all 0.12s',
                  }}>
                    <input type="checkbox" value={opt.value}
                      checked={form.desired_solution.includes(opt.value)}
                      onChange={() => toggleMulti('desired_solution', opt.value)}
                      style={{ accentColor: T.blue }} />
                    <span style={{ fontSize: 12, color: T.carbon, fontWeight: form.desired_solution.includes(opt.value) ? 600 : 400 }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </Field>

            <Field label="¿Qué quiere lograr con esta solución?">
              <textarea value={form.main_objective} onChange={e => update('main_objective', e.target.value)}
                placeholder="Ej: Quiero poder ver en tiempo real cuánto producto me queda, recibir alertas automáticas y eliminar el inventario en papel..."
                rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>
          </div>

          {/* ── SECCIÓN 5: Detalles técnicos ── */}
          <div style={{ background: '#fff', border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>5 · Detalles técnicos</p>

            <Field label="Integraciones externas requeridas">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {INTEGRACIONES_OPTIONS.map(o => (
                  <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    background: form.integraciones_externas.includes(o.value) ? 'rgba(13,110,253,0.08)' : '#F5F5F5',
                    border: `1.5px solid ${form.integraciones_externas.includes(o.value) ? T.blue : T.cardBorder}`,
                    borderRadius: 8, padding: '7px 14px', fontSize: 13 }}>
                    <input type="checkbox" checked={form.integraciones_externas.includes(o.value)}
                      onChange={() => toggleMulti('integraciones_externas', o.value)} style={{ accentColor: T.blue }} />
                    {o.label}
                  </label>
                ))}
              </div>
            </Field>

            <Field label="¿Requiere migración de datos de otro sistema?">
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="radio" checked={form.necesita_migracion === true} onChange={() => update('necesita_migracion', true)} />
                  <span style={{ fontSize: 13, color: T.carbon, fontWeight: 600 }}>✅ Sí</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="radio" checked={form.necesita_migracion === false} onChange={() => update('necesita_migracion', false)} />
                  <span style={{ fontSize: 13, color: T.carbon }}>❌ No</span>
                </label>
              </div>
              {form.necesita_migracion && (
                <input value={form.migracion_detalle} onChange={e => update('migracion_detalle', e.target.value)}
                  placeholder="Ej: Exportar 500 clientes de Excel al nuevo CRM"
                  style={{ ...inputStyle, marginTop: 8 }} />
              )}
            </Field>

            <Field label="Número de usuarios / roles del sistema">
              <select value={form.num_usuarios_roles} onChange={e => update('num_usuarios_roles', e.target.value)} style={inputStyle}>
                <option value="">Seleccionar...</option>
                <option value="solo_dueno">Solo el dueño</option>
                <option value="2_5">2–5 usuarios</option>
                <option value="6_mas">6+ usuarios con roles distintos</option>
              </select>
            </Field>
          </div>

          {/* ── SECCIÓN 4: Información comercial ── */}}
          <div style={{ background: '#fff', border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>4 · Información comercial</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <Field label="Presupuesto aproximado">
                <select value={form.budget_range} onChange={e => update('budget_range', e.target.value)} style={inputStyle}>
                  {BUDGET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Urgencia">
                <select value={form.urgency} onChange={e => update('urgency', e.target.value)} style={inputStyle}>
                  {URGENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </div>

            <Field label="¿Está presente quien toma la decisión de compra?">
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="radio" name="decision_maker" checked={form.decision_maker === true}
                    onChange={() => update('decision_maker', true)} />
                  <span style={{ fontSize: 13, color: T.carbon, fontWeight: 600 }}>✅ Sí, está presente</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="radio" name="decision_maker" checked={form.decision_maker === false}
                    onChange={() => update('decision_maker', false)} />
                  <span style={{ fontSize: 13, color: T.carbon }}>⏳ No, necesita consultarlo</span>
                </label>
              </div>
            </Field>

            <Field label="Notas adicionales (opcional)">
              <textarea value={form.extra_notes} onChange={e => update('extra_notes', e.target.value)}
                placeholder="Detalles que ayuden a afinar la propuesta: integraciones requeridas, sistemas a conectar, restricciones, etc."
                rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>

            <Field label="¿El cliente ya tiene dominio y hosting?">
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="radio" checked={form.tiene_dominio_hosting === true} onChange={() => update('tiene_dominio_hosting', true)} />
                  <span style={{ fontSize: 13, color: T.carbon, fontWeight: 600 }}>✅ Sí, ya tiene</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="radio" checked={form.tiene_dominio_hosting === false} onChange={() => update('tiene_dominio_hosting', false)} />
                  <span style={{ fontSize: 13, color: T.carbon }}>❌ No tiene</span>
                </label>
              </div>
            </Field>

            <Field label="Precio acordado (opcional, MXN sin IVA)">
              <input type="number" value={form.precio_acordado} onChange={e => update('precio_acordado', e.target.value)}
                placeholder="Ej: 45000" style={inputStyle} />
            </Field>

            <Field label="¿El cliente requiere factura (CFDI)?">
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="radio" checked={form.requiere_factura === true} onChange={() => update('requiere_factura', true)} />
                  <span style={{ fontSize: 13, color: T.carbon, fontWeight: 600 }}>🧾 Sí, requiere CFDI</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="radio" checked={form.requiere_factura === false} onChange={() => update('requiere_factura', false)} />
                  <span style={{ fontSize: 13, color: T.carbon }}>❌ No requiere</span>
                </label>
              </div>
            </Field>
          </div>

          <button onClick={handleSubmit} style={{
            background: T.blue, color: '#fff', border: 'none', borderRadius: 10,
            padding: '14px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            width: '100%', transition: 'opacity 0.15s',
          }}>
            Generar propuesta con IA →
          </button>
        </div>
      )}

      {step === 'loading' && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚙️</div>
          <p style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: '0 0 8px' }}>
            Generando propuesta...
          </p>
          <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>
            El Agente Project Manager y el equipo están analizando las necesidades del cliente.<br />
            Esto puede tomar entre 30 y 60 segundos.
          </p>
        </div>
      )}

      {step === 'result' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="print-propuesta">
          {propuesta
            ? <ProspuestaView p={propuesta} businessName={currentName || form.business_name} />
            : (
              (() => {
                const rl = isRateLimit(rawOutput)
                return rl.limited
                  ? (
                    <div style={{ background: '#FFF7E0', border: '1px solid #F6D25A', borderRadius: 10, padding: '16px 20px' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#7A5C00', margin: '0 0 6px' }}>
                        ⏳ Límite diario de Groq alcanzado
                      </p>
                      <p style={{ fontSize: 13, color: '#7A5C00', margin: 0 }}>
                        Se alcanzó el límite de 100 000 tokens diarios.{rl.retryIn ? ` Vuelve a intentarlo en aproximadamente ${rl.retryIn}.` : ' Espera unos minutos e intenta de nuevo.'}
                      </p>
                    </div>
                  ) : (
                    <div style={{ background: '#FEF3F0', border: '1px solid #F8C4B4', borderRadius: 10, padding: '16px 20px' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#C05621', margin: '0 0 8px' }}>
                        La propuesta se generó pero no pudo estructurarse automáticamente.
                      </p>
                      <pre style={{ fontSize: 11, color: T.carbon, whiteSpace: 'pre-wrap', background: T.bone, borderRadius: 6, padding: 12, margin: 0 }}>
                        {rawOutput}
                      </pre>
                    </div>
                  )
              })()
            )
          }
          </div>

          <div className="diagnostico-actions" style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleReset} style={{
              flex: 1, background: T.bone, color: T.navy, border: `1px solid ${T.cardBorder}`,
              borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              ← Nuevo diagnóstico
            </button>
            {currentToken && (
              <button onClick={() => {
                const url = `${window.location.origin}/propuesta/${currentToken}`
                navigator.clipboard.writeText(url).then(() => alert('Enlace copiado:\n' + url))
              }} style={{
                flex: 1, background: '#f0fdf4', color: T.teal, border: `1.5px solid ${T.teal}`,
                borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}>
                🔗 Copiar enlace cliente
              </button>
            )}
            {currentToken && form.contact_phone && (() => {
              const raw = form.contact_phone.replace(/\D/g, '')
              const phone = raw.startsWith('52') ? raw : `52${raw}`
              const url = `${window.location.origin}/propuesta/${currentToken}`
              const text = encodeURIComponent(`Hola, te comparto la propuesta de devmark para tu negocio: ${url}`)
              return (
                <a href={`https://wa.me/${phone}?text=${text}`} target="_blank" rel="noopener noreferrer" style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: '#25D366', color: '#fff', border: 'none',
                  borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 700,
                  textDecoration: 'none', cursor: 'pointer',
                }}>
                  💬 Enviar por WhatsApp
                </a>
              )
            })()}
            <button onClick={() => {
              const prev = document.title
              document.title = `Diagnostico cliente - ${currentName || form.business_name}`
              window.print()
              document.title = prev
            }} style={{
              flex: 1, background: T.teal, color: '#fff', border: 'none',
              borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>
              🖨 Imprimir / PDF
            </button>
          </div>
        </div>
      )}

      {step === 'historial' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={() => setStep('form')} style={{
            alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', color: T.blue,
            fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
          }}>
            ← Nuevo diagnóstico
          </button>
          {/* Barra de búsqueda */}
          <input
            value={histSearch}
            onChange={e => { setHistSearch(e.target.value); setHistPage(1) }}
            placeholder="Buscar por nombre, contacto o problema..."
            style={{ ...inputStyle, padding: '10px 14px', fontSize: 13 }}
          />
          {histLoading && (
            <p style={{ textAlign: 'center', fontSize: 13, color: T.textMuted, padding: '32px 0' }}>Cargando diagnósticos...</p>
          )}
          {!histLoading && historial.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: T.navy, margin: '0 0 6px' }}>Sin diagnósticos aún</p>
              <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>Genera el primer diagnóstico con el formulario.</p>
            </div>
          )}
          {!histLoading && (() => {
            const q = histSearch.toLowerCase()
            const filtered = historial.filter(d =>
              !q ||
              d.business_name?.toLowerCase().includes(q) ||
              d.contact_name?.toLowerCase().includes(q)  ||
              d.main_problem?.toLowerCase().includes(q)
            )
            const totalPages = Math.max(1, Math.ceil(filtered.length / HIST_PER_PAGE))
            const page = Math.min(histPage, totalPages)
            const visible = filtered.slice((page - 1) * HIST_PER_PAGE, page * HIST_PER_PAGE)

            return (
              <>
                {filtered.length === 0 && histSearch && (
                  <p style={{ textAlign: 'center', fontSize: 13, color: T.textMuted, padding: '24px 0' }}>
                    Sin resultados para &ldquo;{histSearch}&rdquo;
                  </p>
                )}
                {visible.map(d => {
                  const st = STATUS_COLORS[d.status] ?? STATUS_COLORS.pendiente
                  const costo = d.propuesta ? `${(d.propuesta.costo_minimo / 1000).toFixed(0)}k – ${(d.propuesta.costo_maximo / 1000).toFixed(0)}k MXN` : null
                  return (
                    <button key={d.id} onClick={() => { setSelected(d); setStep('historial-detail') }} style={{
                      display: 'flex', alignItems: 'center', gap: 14, background: '#fff',
                      border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '14px 18px',
                      cursor: 'pointer', textAlign: 'left', transition: 'box-shadow 0.15s',
                      width: '100%',
                    }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: T.bone, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                        🏢
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{d.business_name}</span>
                          <span style={{ fontSize: 11, color: T.textMuted }}>{d.business_type}</span>
                        </div>
                        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.contact_name} · {d.main_problem?.slice(0, 70)}{(d.main_problem?.length ?? 0) > 70 ? '…' : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: st.bg, color: st.color }}>{st.label}</span>
                        {costo && <span style={{ fontSize: 11, fontWeight: 600, color: T.teal }}>{costo}</span>}
                        <span style={{ fontSize: 10, color: T.textMuted }}>{new Date(d.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </button>
                  )
                })}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, paddingTop: 4 }}>
                    <button onClick={() => setHistPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      style={{ background: 'none', border: `1px solid ${T.cardBorder}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                      ←
                    </button>
                    <span style={{ fontSize: 12, color: T.textMuted }}>{page} / {totalPages}</span>
                    <button onClick={() => setHistPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      style={{ background: 'none', border: `1px solid ${T.cardBorder}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>
                      →
                    </button>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      )}

      {step === 'historial-detail' && selected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <button onClick={() => setStep('historial')} className="print-hide" style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
            color: T.blue, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
          }}>
            ← Volver al historial
          </button>

          {/* Barra de acciones */}
          <div className="diagnostico-actions" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Fila 1: badge de estado + acciones primarias */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {(() => {
                const st = STATUS_COLORS[selected.status] ?? STATUS_COLORS.pendiente
                return <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: st.bg, color: st.color, flexShrink: 0 }}>{st.label}</span>
              })()}
              <button
                onClick={() => generarMultiAgente(selected)}
                disabled={multiLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: T.blue, color: '#fff', border: 'none',
                  borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700,
                  cursor: multiLoading ? 'default' : 'pointer',
                  opacity: multiLoading ? 0.5 : 1,
                }}>
                {multiLoading ? '⏳ Consultando agentes...' : '✨ Generar propuesta multi-agente'}
              </button>
              {selected.propuesta && selected.status === 'borrador' && (
                <button
                  onClick={() => aprobarPropuesta(selected)}
                  disabled={aprobarLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: T.teal, color: '#fff', border: 'none',
                    borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700,
                    cursor: aprobarLoading ? 'wait' : 'pointer', opacity: aprobarLoading ? 0.7 : 1,
                  }}>
                  {aprobarLoading ? '⏳ Aprobando...' : '✅ Aprobar propuesta'}
                </button>
              )}
            </div>

            {/* Fila 2: acciones secundarias */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => regenerarDiagnostico(selected)} disabled={regenLoading} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#fff', color: T.navy, border: `1.5px solid ${T.cardBorder}`,
              borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600,
              cursor: regenLoading ? 'wait' : 'pointer', opacity: regenLoading ? 0.7 : 1,
            }}>
              {regenLoading ? '⏳ Generando...' : '🔄 Regenerar (PM solo)'}
            </button>
            {selected.status !== 'aprobada' && selected.status !== 'enviada' && (
              <button onClick={() => editarDiagnostico(selected)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#fff', color: T.navy, border: `1.5px solid ${T.cardBorder}`,
                borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                ✏️ Editar y re-enviar
              </button>
            )}
            {selected.propuesta && (
              <button onClick={() => {
                const prev = document.title
                document.title = `Diagnostico cliente - ${selected.business_name}`
                window.print()
                document.title = prev
              }} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#fff', color: T.navy, border: `1.5px solid ${T.cardBorder}`,
                borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                🖨 Imprimir / PDF
              </button>
            )}
            {selected.propuesta && (
              <button onClick={() => {
                if (!selected.public_token) { alert('Token no disponible.'); return }
                const url = `${window.location.origin}/propuesta/${selected.public_token}`
                navigator.clipboard.writeText(url).then(() => alert('Enlace copiado:\n' + url))
              }} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#fff', color: T.teal, border: `1.5px solid ${T.teal}`,
                borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                🔗 Copiar enlace cliente
              </button>
            )}
            {selected.propuesta && selected.contact_phone && (() => {
              const raw = selected.contact_phone.replace(/\D/g, '')
              const phone = raw.startsWith('52') ? raw : `52${raw}`
              const url = `${window.location.origin}/propuesta/${selected.public_token}`
              const text = encodeURIComponent(`Hola, te comparto la propuesta de devmark para tu negocio: ${url}`)
              return (
                <a href={`https://wa.me/${phone}?text=${text}`} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#25D366', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600,
                  textDecoration: 'none', cursor: 'pointer',
                }}>
                  💬 Enviar por WhatsApp
                </a>
              )
            })()}
            <button onClick={() => deleteDiagnostico(selected.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto',
              background: '#FEF3F0', color: '#C05621', border: '1.5px solid #F8C4B4',
              borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              🗑 Eliminar
            </button>
            </div>
            {multiError && (
              <div style={{ background: '#FEF3F0', border: '1px solid #F8C4B4', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#C05621' }}>
                {multiError}
              </div>
            )}
            {regenError && (
              <div style={{ background: isRateLimit(regenError).limited ? '#FFF7E0' : '#FEF3F0', border: `1px solid ${isRateLimit(regenError).limited ? '#F6D25A' : '#F8C4B4'}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: isRateLimit(regenError).limited ? '#7A5C00' : '#C05621' }}>
                {isRateLimit(regenError).limited
                  ? `⏳ Límite diario de Groq alcanzado.${isRateLimit(regenError).retryIn ? ` Espera ~${isRateLimit(regenError).retryIn}.` : ' Espera unos minutos.'}`
                  : regenError
                }
              </div>
            )}
          </div>

          <div className="print-propuesta">
            {selected.propuesta
              ? <ProspuestaView p={selected.propuesta} businessName={selected.business_name} />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(() => {
                    const rl = isRateLimit(selected.raw_output ?? '')
                    return rl.limited
                      ? (
                        <div style={{ background: '#FFF7E0', border: '1px solid #F6D25A', borderRadius: 10, padding: '16px 20px' }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#7A5C00', margin: '0 0 6px' }}>⏳ Límite diario de Groq alcanzado</p>
                          <p style={{ fontSize: 13, color: '#7A5C00', margin: 0 }}>
                            {rl.retryIn ? `Vuelve a intentarlo en ~${rl.retryIn}.` : 'Espera unos minutos e intenta regenerar.'}
                          </p>
                        </div>
                      ) : (
                        <div style={{ background: '#FEF3F0', border: '1px solid #F8C4B4', borderRadius: 10, padding: '16px 20px' }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#C05621', margin: '0 0 4px' }}>
                            Este diagnóstico no pudo estructurarse automáticamente.
                          </p>
                          <p style={{ fontSize: 12, color: '#C05621', margin: 0 }}>
                            Usa <strong>Regenerar propuesta</strong> para reintentarlo, o <strong>Editar y re-enviar</strong> para ajustar los datos.
                          </p>
                        </div>
                      )
                  })()}
                  {selected.raw_output && !isRateLimit(selected.raw_output).limited && (
                    <details style={{ background: T.bone, border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: '12px 16px' }}>
                      <summary style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, cursor: 'pointer' }}>Ver respuesta cruda del agente</summary>
                      <pre style={{ fontSize: 11, color: T.carbon, whiteSpace: 'pre-wrap', marginTop: 10 }}>{selected.raw_output}</pre>
                    </details>
                  )}
                </div>
              )
            }
          </div>
        </div>
      )}
    </div>
  )
}
