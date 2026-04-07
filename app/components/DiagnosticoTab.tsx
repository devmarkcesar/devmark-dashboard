'use client'
import { useState } from 'react'
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

export function DiagnosticoTab() {
  const [step, setStep]           = useState<'form' | 'loading' | 'result'>('form')
  const [error, setError]         = useState<string | null>(null)
  const [propuesta, setPropuesta] = useState<Propuesta | null>(null)
  const [rawOutput, setRawOutput] = useState('')

  const [form, setForm] = useState({
    business_name:     '',
    business_type:     '',
    contact_name:      '',
    contact_phone:     '',
    contact_email:     '',
    num_employees:     '',
    main_problem:      '',
    current_situation: '',
    current_tools:     [] as string[],
    desired_solution:  '',
    main_objective:    '',
    budget_range:      'no_definido',
    urgency:           'sin_prisa',
    decision_maker:    true,
    extra_notes:       '',
  })

  function update(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleTool(value: string) {
    setForm(f => ({
      ...f,
      current_tools: f.current_tools.includes(value)
        ? f.current_tools.filter(t => t !== value)
        : [...f.current_tools, value],
    }))
  }

  async function handleSubmit() {
    if (!form.business_name.trim() || !form.main_problem.trim() || !form.contact_name.trim()) {
      setError('Nombre del negocio, contacto y problema principal son obligatorios.')
      return
    }
    setError(null)
    setStep('loading')

    try {
      const res = await fetch('/api/diagnostico', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...form,
          current_tools: form.current_tools.join(', '),
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
      main_problem: '', current_situation: '', current_tools: [],
      desired_solution: '', main_objective: '',
      budget_range: 'no_definido', urgency: 'sin_prisa',
      decision_maker: true, extra_notes: '',
    })
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 48px', fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.navy, margin: '0 0 4px' }}>Diagnóstico de cliente</h1>
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

            <Field label="Presencia digital actual">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {SITUATION_OPTIONS.map(opt => (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="radio" name="current_situation" value={opt.value}
                      checked={form.current_situation === opt.value}
                      onChange={() => update('current_situation', opt.value)} />
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
                      onChange={() => toggleTool(opt.value)}
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

            <Field label="¿Qué tipo de solución busca?">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                {SOLUTION_OPTIONS.map(opt => (
                  <label key={opt.value} style={{
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    padding: '8px 12px', borderRadius: 8, border: '1.5px solid',
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
