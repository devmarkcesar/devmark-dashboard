'use client'
import { useState, useEffect, useCallback } from 'react'
import { T } from './tokens'

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

interface DiagnosticoRecord {
  id:                number
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
  status:            string
  propuesta:         Propuesta | null
  raw_output:        string
  created_at:        string
}

interface Propuesta {
  diagnostico_resumen:           string
  solucion_propuesta:            string
  stack_tecnologico:             string[]
  entregables:                   string[]
  no_incluye:                    string[]
  costo_minimo:                  number
  costo_maximo:                  number
  costo_infraestructura_mensual: number
  anticipo:                      number
  timeline_semanas:              number
  fases:                         { semana: string; descripcion: string }[]
  garantia_dias:                 number
  notas_adicionales:             string
}

function fmt(n: number) {
  return n?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '16px 20px' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>{title}</p>
      {children}
    </div>
  )
}

function CostCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
      <p style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 800, color: accent, margin: 0 }}>{value}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: T.navy }}>{label}</label>
      {children}
    </div>
  )
}

function ProspuestaView({ p, businessName }: { p: Propuesta; businessName: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Encabezado */}
      <div style={{ background: T.navy, borderRadius: 10, padding: '20px 24px', color: '#fff' }}>
        <div style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Propuesta para</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{businessName}</div>
        <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>
          devmark — {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <Section title="📋 Diagnóstico">
        <p style={{ fontSize: 14, color: T.carbon, lineHeight: 1.7 }}>{p.diagnostico_resumen}</p>
      </Section>

      <Section title="💡 Solución propuesta">
        <p style={{ fontSize: 14, color: T.carbon, lineHeight: 1.7 }}>{p.solucion_propuesta}</p>
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        <CostCard label="Inversión"       value={`${fmt(p.costo_minimo)} – ${fmt(p.costo_maximo)}`}                         accent={T.navy} />
        <CostCard label="Anticipo (50%)"  value={fmt(p.anticipo || Math.round(p.costo_minimo * 0.5))}                       accent={T.blue} />
        <CostCard label="Infraestructura" value={`${fmt(p.costo_infraestructura_mensual)}/mes`}                             accent={T.teal} />
        <CostCard label="Tiempo estimado" value={`${p.timeline_semanas} semanas`}                                           accent="#BA7517" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Section title="✅ Qué incluye">
          <ul style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {p.entregables?.map((e, i) => <li key={i} style={{ fontSize: 13, color: T.carbon, lineHeight: 1.5 }}>{e}</li>)}
          </ul>
        </Section>
        <Section title="❌ No incluye">
          <ul style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {p.no_incluye?.map((e, i) => <li key={i} style={{ fontSize: 13, color: T.carbon, lineHeight: 1.5 }}>{e}</li>)}
          </ul>
        </Section>
      </div>

      <Section title="🛠 Stack tecnológico">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {p.stack_tecnologico?.map((tech, i) => (
            <span key={i} style={{
              background: 'rgba(24,95,165,0.1)', color: T.blue, fontSize: 12, fontWeight: 600,
              padding: '4px 10px', borderRadius: 99, border: `1px solid rgba(24,95,165,0.2)`,
            }}>{tech}</span>
          ))}
        </div>
      </Section>

      <Section title="📅 Plan de trabajo">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {p.fases?.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ background: T.teal, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap', flexShrink: 0 }}>
                Sem {f.semana}
              </div>
              <p style={{ fontSize: 13, color: T.carbon, margin: 0, lineHeight: 1.5 }}>{f.descripcion}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="🛡 Garantía y soporte">
        <p style={{ fontSize: 13, color: T.carbon, lineHeight: 1.6 }}>
          {p.garantia_dias} días de garantía post-entrega ante errores de funcionamiento. Soporte incluido durante el periodo de garantía.
        </p>
        {p.notas_adicionales && (
          <p style={{ fontSize: 13, color: T.textMuted, marginTop: 8, fontStyle: 'italic' }}>{p.notas_adicionales}</p>
        )}
      </Section>

      <div style={{ background: T.bone, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '16px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: T.navy, fontWeight: 700, margin: '0 0 4px' }}>Forma de pago: 50% anticipo al iniciar · 50% al entregar</p>
        <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>devmark · Guadalajara, México · devmark.mx</p>
      </div>
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
}

export function DiagnosticoTab() {
  const [step, setStep]               = useState<'form' | 'loading' | 'result' | 'historial' | 'historial-detail'>('form')
  const [error, setError]             = useState<string | null>(null)
  const [propuesta, setPropuesta]     = useState<Propuesta | null>(null)
  const [rawOutput, setRawOutput]     = useState('')
  const [historial, setHistorial]     = useState<DiagnosticoRecord[]>([])
  const [histLoading, setHistLoading] = useState(false)
  const [selected, setSelected]       = useState<DiagnosticoRecord | null>(null)
  const [currentName, setCurrentName] = useState('')
  const [regenLoading, setRegenLoading] = useState(false)

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

  async function deleteDiagnostico(id: number) {
    if (!confirm('¿Eliminar este diagnóstico? Esta acción no se puede deshacer.')) return
    await fetch(`/api/diagnostico/${id}`, { method: 'DELETE' })
    setHistorial(prev => prev.filter(d => d.id !== id))
    setStep('historial')
    setSelected(null)
  }

  async function regenerarDiagnostico(d: DiagnosticoRecord) {
    setRegenLoading(true)
    try {
      const res  = await fetch(`/api/diagnostico/${d.id}`, { method: 'PATCH' })
      const data = await res.json()
      if (data.ok) {
        const updated = data.diagnostico
        setSelected(updated)
        setHistorial(prev => prev.map(x => x.id === d.id ? { ...x, ...updated } : x))
      }
    } catch { /* ignorar */ }
    setRegenLoading(false)
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
    })
    setPropuesta(null)
    setRawOutput('')
    setError(null)
    setSelected(null)
    setStep('form')
  }

  function toggleMulti(field: 'current_situation' | 'current_tools' | 'desired_solution', value: string) {
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
    setError(null)
    setStep('loading')
    setCurrentName(form.business_name)

    try {
      const res = await fetch('/api/diagnostico', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...form,
          current_situation: form.current_situation.join(', '),
          current_tools:     form.current_tools.join(', '),
          desired_solution:  form.desired_solution.join(', '),
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
    setForm({
      business_name: '', business_type: '', contact_name: '',
      contact_phone: '', contact_email: '', num_employees: '',
      main_problem: '', current_situation: [], current_tools: [],
      desired_solution: [], main_objective: '',
      budget_range: 'no_definido', urgency: 'sin_prisa',
      decision_maker: true, extra_notes: '',
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
    <div style="font-size:8pt; color:#888;">devmark.mx · Guadalajara, México</div>
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
          <button
            onClick={() => { step === 'historial' || step === 'historial-detail' ? setStep('form') : (loadHistorial(), setStep('historial')) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
              background: (step === 'historial' || step === 'historial-detail') ? T.navy : '#fff',
              color: (step === 'historial' || step === 'historial-detail') ? '#fff' : T.navy,
              border: `1.5px solid ${T.cardBorder}`,
              borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}>
            <span style={{ fontSize: 15 }}>🗂</span>
            Historial {historial.length > 0 && `(${historial.length})`}
          </button>
        </div>
      </div>

      {step === 'form' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && (
            <div style={{ background: '#FEF3F0', border: '1px solid #F8C4B4', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#C05621' }}>
              {error}
            </div>
          )}

          {/* ── SECCIÓN 1: Datos del negocio ── */}
          <div style={{ background: '#fff', border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>1 · Datos del negocio</p>

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

          {/* ── SECCIÓN 4: Información comercial ── */}
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
              <div style={{ background: '#FEF3F0', border: '1px solid #F8C4B4', borderRadius: 10, padding: '16px 20px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#C05621', margin: '0 0 8px' }}>
                  La propuesta se generó pero no pudo estructurarse automáticamente.
                </p>
                <pre style={{ fontSize: 11, color: T.carbon, whiteSpace: 'pre-wrap', background: T.bone, borderRadius: 6, padding: 12, margin: 0 }}>
                  {rawOutput}
                </pre>
              </div>
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
            <button onClick={() => window.print()} style={{
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
          {!histLoading && historial.map(d => {
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
        </div>
      )}

      {step === 'historial-detail' && selected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <button onClick={() => setStep('historial')} style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
            color: T.blue, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
          }}>
            ← Volver al historial
          </button>

          {/* Barra de acciones */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => regenerarDiagnostico(selected)} disabled={regenLoading} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: T.teal, color: '#fff', border: 'none',
              borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600,
              cursor: regenLoading ? 'wait' : 'pointer', opacity: regenLoading ? 0.7 : 1,
            }}>
              {regenLoading ? '⏳ Generando...' : '🔄 Regenerar propuesta'}
            </button>
            <button onClick={() => editarDiagnostico(selected)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#fff', color: T.navy, border: `1.5px solid ${T.cardBorder}`,
              borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              ✏️ Editar y re-enviar
            </button>
            {selected.propuesta && (
              <button onClick={() => window.print()} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#fff', color: T.navy, border: `1.5px solid ${T.cardBorder}`,
                borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                🖨 Imprimir / PDF
              </button>
            )}
            <button onClick={() => deleteDiagnostico(selected.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto',
              background: '#FEF3F0', color: '#C05621', border: '1.5px solid #F8C4B4',
              borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              🗑 Eliminar
            </button>
          </div>

          <div className="print-propuesta">
            {selected.propuesta
              ? <ProspuestaView p={selected.propuesta} businessName={selected.business_name} />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: '#FEF3F0', border: '1px solid #F8C4B4', borderRadius: 10, padding: '16px 20px' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#C05621', margin: '0 0 4px' }}>
                      Este diagnóstico no pudo estructurarse automáticamente.
                    </p>
                    <p style={{ fontSize: 12, color: '#C05621', margin: 0 }}>
                      Usa <strong>Regenerar propuesta</strong> para reintentarlo, o <strong>Editar y re-enviar</strong> para ajustar los datos.
                    </p>
                  </div>
                  {selected.raw_output && (
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
