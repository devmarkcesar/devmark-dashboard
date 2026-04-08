'use client'
import { useState } from 'react'
import { T } from '../components/tokens'

const INDUSTRIES = [
  'Restaurante / Cafetería', 'Taquería / Fonda', 'Ferretería / Tlapalería',
  'Tienda de abarrotes', 'Boutique / Ropa', 'Salón de belleza / Barbería',
  'Contaduría / Despacho fiscal', 'Despacho jurídico', 'Clínica / Consultorio',
  'Gimnasio / Spa', 'Agencia de marketing', 'Constructora / Inmobiliaria',
  'Escuela / Academia', 'Taller mecánico', 'Farmacia', 'Otro',
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
  { value: 'menos_5k',   label: 'Menos de $5,000 MXN' },
  { value: '5k_15k',     label: '$5,000 – $15,000 MXN' },
  { value: '15k_50k',    label: '$15,000 – $50,000 MXN' },
  { value: 'mas_50k',    label: 'Más de $50,000 MXN' },
  { value: 'no_definido',label: 'No lo tengo definido aún' },
]

const URGENCY_OPTIONS = [
  { value: 'inmediata', label: 'Lo antes posible' },
  { value: '1_mes',     label: 'En el próximo mes' },
  { value: '3_meses',   label: 'En los próximos 3 meses' },
  { value: 'sin_prisa', label: 'Sin fecha límite definida' },
]

const EMPLOYEE_OPTIONS = [
  { value: '1',      label: 'Solo yo' },
  { value: '2-5',    label: '2–5 empleados' },
  { value: '6-15',   label: '6–15 empleados' },
  { value: '16-50',  label: '16–50 empleados' },
  { value: '50+',    label: 'Más de 50' },
]

const TOOLS_OPTIONS = [
  { value: 'cuaderno',   label: '📓 Cuaderno / Libreta' },
  { value: 'excel',      label: '📊 Excel / Hojas de cálculo' },
  { value: 'whatsapp',   label: '📱 WhatsApp' },
  { value: 'facebook',   label: '👍 Facebook / Instagram' },
  { value: 'pos',        label: '💳 Terminal punto de venta (POS)' },
  { value: 'software',   label: '💻 Software / sistema existente' },
  { value: 'nada',       label: '❌ No usa ninguna herramienta digital' },
]

interface Propuesta {
  diagnostico_resumen:            string
  solucion_propuesta:             string
  stack_tecnologico:              string[]
  entregables:                    string[]
  no_incluye:                     string[]
  costo_minimo:                   number
  costo_maximo:                   number
  costo_infraestructura_mensual:  number
  anticipo:                       number
  timeline_semanas:               number
  fases:                          { semana: string; descripcion: string }[]
  garantia_dias:                  number
  notas_adicionales:              string
}

function fmt(n: number) {
  return n?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
}

function ProspuestaView({ p, businessName }: { p: Propuesta; businessName: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Encabezado */}
      <div style={{ background: T.navy, borderRadius: 10, padding: '20px 24px', color: '#fff' }}>
        <div style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Propuesta para</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{businessName}</div>
        <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>devmark — {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      {/* Diagnóstico */}
      <Section title="📋 Diagnóstico">
        <p style={{ fontSize: 14, color: T.carbon, lineHeight: 1.7 }}>{p.diagnostico_resumen}</p>
      </Section>

      {/* Solución */}
      <Section title="💡 Solución propuesta">
        <p style={{ fontSize: 14, color: T.carbon, lineHeight: 1.7 }}>{p.solucion_propuesta}</p>
      </Section>

      {/* Costos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        <CostCard label="Inversión" value={`${fmt(p.costo_minimo)} – ${fmt(p.costo_maximo)}`} accent={T.navy} />
        <CostCard label="Anticipo (50%)" value={fmt(p.anticipo || Math.round(p.costo_minimo * 0.5))} accent={T.blue} />
        <CostCard label="Infraestructura" value={`${fmt(p.costo_infraestructura_mensual)}/mes`} accent={T.teal} />
        <CostCard label="Tiempo estimado" value={`${p.timeline_semanas} semanas`} accent="#BA7517" />
      </div>

      {/* Entregables */}
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

      {/* Stack tecnológico */}
      <Section title="🛠 Stack tecnológico">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {p.stack_tecnologico?.map((t, i) => (
            <span key={i} style={{ background: 'rgba(24,95,165,0.1)', color: T.blue, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, border: `1px solid rgba(24,95,165,0.2)` }}>{t}</span>
          ))}
        </div>
      </Section>

      {/* Timeline */}
      <Section title="📅 Plan de trabajo">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {p.fases?.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ background: T.teal, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap', flexShrink: 0 }}>Sem {f.semana}</div>
              <p style={{ fontSize: 13, color: T.carbon, margin: 0, lineHeight: 1.5 }}>{f.descripcion}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Garantía */}
      <Section title="🛡 Garantía y soporte">
        <p style={{ fontSize: 13, color: T.carbon, lineHeight: 1.6 }}>
          {p.garantia_dias} días de garantía post-entrega ante errores de funcionamiento. Soporte incluido durante el periodo de garantía.
        </p>
        {p.notas_adicionales && (
          <p style={{ fontSize: 13, color: T.textMuted, marginTop: 8, fontStyle: 'italic' }}>{p.notas_adicionales}</p>
        )}
      </Section>

      {/* CTA */}
      <div style={{ background: T.bone, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '16px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: T.navy, fontWeight: 700, margin: '0 0 4px' }}>Forma de pago: 50% anticipo al iniciar · 50% al entregar</p>
        <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>devmark · Guadalajara, México · devmark.mx</p>
      </div>
    </div>
  )
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

export default function DiagnosticoPage() {
  const [step, setStep]           = useState<'form' | 'loading' | 'result'>('form')
  const [error, setError]         = useState<string | null>(null)
  const [propuesta, setPropuesta] = useState<Propuesta | null>(null)
  const [rawOutput, setRawOutput] = useState('')

  const [form, setForm] = useState({
    business_name:      '',
    business_type:      '',
    contact_name:       '',
    contact_phone:      '',
    contact_email:      '',
    num_employees:      '',
    main_problem:       '',
    main_objective:     '',
    current_situation:  '',
    current_tools:      [] as string[],
    desired_solution:   '',
    budget_range:       'no_definido',
    urgency:            'sin_prisa',
    decision_maker:     false,
    extra_notes:        '',
  })

  function update(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleTool(tool: string) {
    setForm(f => ({
      ...f,
      current_tools: f.current_tools.includes(tool)
        ? f.current_tools.filter(t => t !== tool)
        : [...f.current_tools, tool],
    }))
  }

  async function handleSubmit() {
    if (!form.business_name.trim() || !form.main_problem.trim()) {
      setError('El nombre del negocio y el problema principal son obligatorios.')
      return
    }
    setError(null)
    setStep('loading')

    try {
      const res = await fetch('/api/diagnostico', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
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
      main_problem: '', main_objective: '', current_situation: '',
      current_tools: [], desired_solution: '',
      budget_range: 'no_definido', urgency: 'sin_prisa',
      decision_maker: false, extra_notes: '',
    })
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 48px', fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.navy, margin: '0 0 4px' }}>Diagnóstico de Cliente</h1>
        <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>
          Completa el formulario con las necesidades del cliente. Los agentes generarán una propuesta completa al instante.
        </p>
      </div>

      {step === 'form' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && (
            <div style={{ background: '#FEF3F0', border: '1px solid #F8C4B4', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#C05621' }}>
              {error}
            </div>
          )}

          {/* Datos del negocio */}
          <div style={{ background: '#fff', border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Datos del negocio</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Nombre del negocio *">
                <input value={form.business_name} onChange={e => update('business_name', e.target.value)}
                  placeholder="Ej: Tacos El Güero" style={inputStyle} />
              </Field>
              <Field label="Nombre del contacto">
                <input value={form.contact_name} onChange={e => update('contact_name', e.target.value)}
                  placeholder="Ej: Juan López" style={inputStyle} />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Teléfono">
                <input value={form.contact_phone} onChange={e => update('contact_phone', e.target.value)}
                  placeholder="Ej: 33 1234 5678" type="tel" style={inputStyle} />
              </Field>
              <Field label="Email">
                <input value={form.contact_email} onChange={e => update('contact_email', e.target.value)}
                  placeholder="Ej: juan@negocio.com" type="email" style={inputStyle} />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Industria / Giro del negocio">
                <select value={form.business_type} onChange={e => update('business_type', e.target.value)} style={inputStyle}>
                  <option value="">Selecciona una opción</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>
              <Field label="Tamaño del negocio">
                <select value={form.num_employees} onChange={e => update('num_employees', e.target.value)} style={inputStyle}>
                  <option value="">¿Cuántos empleados?</option>
                  {EMPLOYEE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Problema principal */}
          <div style={{ background: '#fff', border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Problema y necesidad</p>

            <Field label="¿Cuál es el problema principal del negocio? *">
              <textarea value={form.main_problem} onChange={e => update('main_problem', e.target.value)}
                placeholder="Ej: No tienen sistema para llevar el inventario, lo hacen en papel y se pierde producto..."
                rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>

            <Field label="Situación digital actual">
              {SITUATION_OPTIONS.map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 6 }}>
                  <input type="radio" name="current_situation" value={opt.value}
                    checked={form.current_situation === opt.value}
                    onChange={() => update('current_situation', opt.value)} />
                  <span style={{ fontSize: 13, color: T.carbon }}>{opt.label}</span>
                </label>
              ))}
            </Field>

            <Field label="¿Qué objetivo quiere lograr?">
              <input value={form.main_objective} onChange={e => update('main_objective', e.target.value)}
                placeholder="Ej: Vender más, dejar de perder inventario, tener presencia web..."
                style={inputStyle} />
            </Field>

            <Field label="Herramientas que usa actualmente">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {TOOLS_OPTIONS.map(opt => (
                  <label key={opt.value} style={{
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    padding: '8px 12px', borderRadius: 8, border: `1.5px solid`,
                    borderColor: form.current_tools.includes(opt.value) ? T.teal : T.cardBorder,
                    background: form.current_tools.includes(opt.value) ? 'rgba(29,158,117,0.06)' : '#fff',
                    transition: 'all 0.12s',
                  }}>
                    <input type="checkbox"
                      checked={form.current_tools.includes(opt.value)}
                      onChange={() => toggleTool(opt.value)}
                      style={{ accentColor: T.teal }} />
                    <span style={{ fontSize: 12, color: T.carbon, fontWeight: form.current_tools.includes(opt.value) ? 600 : 400 }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </Field>
          </div>

          {/* Solución deseada */}
          <div style={{ background: '#fff', border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Solución y presupuesto</p>

            <Field label="¿Qué tipo de solución busca?">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {SOLUTION_OPTIONS.map(opt => (
                  <label key={opt.value} style={{
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    padding: '8px 12px', borderRadius: 8, border: `1.5px solid`,
                    borderColor: form.desired_solution === opt.value ? T.blue : T.cardBorder,
                    background: form.desired_solution === opt.value ? 'rgba(24,95,165,0.06)' : '#fff',
                    transition: 'all 0.12s',
                  }}>
                    <input type="radio" name="desired_solution" value={opt.value}
                      checked={form.desired_solution === opt.value}
                      onChange={() => update('desired_solution', opt.value)}
                      style={{ accentColor: T.blue }} />
                    <span style={{ fontSize: 12, color: T.carbon, fontWeight: form.desired_solution === opt.value ? 600 : 400 }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

            <Field label="Notas adicionales (opcional)">
              <textarea value={form.extra_notes} onChange={e => update('extra_notes', e.target.value)}
                placeholder="Cualquier detalle adicional que sea útil para la propuesta..."
                rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', borderRadius: 8, background: form.decision_maker ? 'rgba(29,158,117,0.06)' : T.bone, border: `1.5px solid ${form.decision_maker ? T.teal : T.cardBorder}`, transition: 'all 0.12s' }}>
              <input type="checkbox" checked={form.decision_maker} onChange={e => update('decision_maker', e.target.checked)} style={{ accentColor: T.teal, width: 18, height: 18 }} />
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>¿El tomador de decisión está presente?</span>
                <p style={{ fontSize: 11, color: T.textMuted, margin: '2px 0 0' }}>{form.decision_maker ? 'Sí — puede cerrar la venta hoy' : 'No — necesita consultarlo con alguien más'}</p>
              </div>
            </label>
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
          {propuesta
            ? <ProspuestaView p={propuesta} businessName={form.business_name} />
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

          <div style={{ display: 'flex', gap: 10 }}>
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

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', fontSize: 13, borderRadius: 8,
  border: `1.5px solid ${T.cardBorder}`, outline: 'none', background: T.bone,
  color: T.carbon, fontFamily: 'inherit', boxSizing: 'border-box',
}
