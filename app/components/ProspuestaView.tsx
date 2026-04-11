'use client'
import React from 'react'
import { T } from './tokens'

export interface Propuesta {
  diagnostico_resumen:           string
  solucion_propuesta:            string
  factor_complejidad?:           'basico' | 'estandar' | 'premium'
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
  desglose_costos?:              { concepto: string; tipo: 'unico' | 'mensual' | 'anual' | 'incluido' | 'opcional'; monto_min: number; monto_max: number }[]
  soporte_recomendado?:          'basico' | 'estandar' | 'premium'
  revisiones_incluidas?:         number
  iva_incluido?:                 boolean
  iva_porcentaje?:               number
  dias_estimados?:               { nivel: number; dias_base: number; dias_ajustado: number; justificacion: string }
}

function fmt(n: number | string | undefined | null) {
  if (n == null) return '$0'
  const num = typeof n === 'string' ? parseFloat((n as string).replace(/,/g, '')) : n
  if (isNaN(num as number)) return '$0'
  return (num as number).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '16px 20px' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>{title}</p>
      {children}
    </div>
  )
}

/** Encabezado que se repite al inicio de cada hoja impresa */
function PrintHeader({ fecha, hora }: { fecha: string; hora: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      paddingBottom: '5mm', borderBottom: '2.5px solid #1D9E75', marginBottom: '7mm',
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logos/horizontal/dev-hori-1.png" alt="devmark" style={{ height: 46, objectFit: 'contain' }} />
      <div style={{ textAlign: 'right', fontSize: 10, lineHeight: 1.6 }}>
        <div style={{ fontWeight: 700, color: '#0C2D4E' }}>Guadalajara, Jalisco, México</div>
        <div style={{ fontWeight: 700, color: '#0C2D4E' }}>{fecha} · {hora}</div>
      </div>
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

export function ProspuestaView({ p, businessName }: { p: Propuesta; businessName: string }) {
  const now = new Date()
  const fechaFormateada = now.toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const horaFormateada = now.toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })

  const soporteItem = p.desglose_costos?.find(
    d => d.tipo === 'opcional' && d.concepto.toLowerCase().includes('soporte')
  )
  const soporteTierLabel = p.soporte_recomendado === 'basico' ? 'Básico'
    : p.soporte_recomendado === 'estandar' ? 'Estándar' : 'Premium'
  const soportePrecio = soporteItem
    ? `${soporteTierLabel} (${fmt(soporteItem.monto_min)}/mes)`
    : p.soporte_recomendado === 'basico' ? 'Básico ($500/mes)'
    : p.soporte_recomendado === 'estandar' ? 'Estándar ($1,000/mes)' : 'Premium ($2,000/mes)'
  const extraItem = p.desglose_costos?.find(
    d => (d.concepto.toLowerCase().includes('cambio') || d.concepto.toLowerCase().includes('extra')) && d.monto_min > 0
  )
  const extraRate = extraItem ? `${fmt(extraItem.monto_min)} MXN/hora` : '$300 MXN/hora'

  return (
    <>
      {/* ── VISTA PANTALLA: flujo continuo normal ───────────────────────── */}
      <div className="propuesta-screen" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div style={{ background: T.navy, borderRadius: 10, padding: '20px 24px', color: '#fff' }}>
          <div style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Propuesta para</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{businessName}</div>
          <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>devmark — {fechaFormateada}</div>
        </div>

        <Section title="📋 Diagnóstico">
          <p style={{ fontSize: 14, color: T.carbon, lineHeight: 1.7 }}>{p.diagnostico_resumen}</p>
        </Section>

        <Section title="💡 Solución propuesta">
          <p style={{ fontSize: 14, color: T.carbon, lineHeight: 1.7 }}>{p.solucion_propuesta}</p>
        </Section>

        {p.factor_complejidad && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 99,
            background: p.factor_complejidad === 'basico' ? 'rgba(29,158,117,0.1)' : p.factor_complejidad === 'estandar' ? 'rgba(24,95,165,0.1)' : 'rgba(186,117,23,0.1)',
            border: `1px solid ${p.factor_complejidad === 'basico' ? 'rgba(29,158,117,0.25)' : p.factor_complejidad === 'estandar' ? 'rgba(24,95,165,0.25)' : 'rgba(186,117,23,0.25)'}`,
          }}>
            <span style={{ fontSize: 12, fontWeight: 700,
              color: p.factor_complejidad === 'basico' ? T.teal : p.factor_complejidad === 'estandar' ? T.blue : '#BA7517',
            }}>Complejidad: {p.factor_complejidad === 'basico' ? 'Básico' : p.factor_complejidad === 'estandar' ? 'Estándar' : 'Premium'}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {(() => {
            const ivaMult   = 1 + (Number(p.iva_porcentaje) || 16) / 100
            const minTotal  = Math.round((Number(p.costo_minimo)  || 0) * ivaMult)
            const maxTotal  = Math.round((Number(p.costo_maximo)  || 0) * ivaMult)
            const anticipo  = Math.round(minTotal * 0.5)
            return (
              <>
                <CostCard label="Inversión (c/IVA)"  value={`${fmt(minTotal)} – ${fmt(maxTotal)}`}              accent={T.navy} />
                <CostCard label="Anticipo (50%)"       value={fmt(anticipo)}                                    accent={T.blue} />
                <CostCard label="Infraestructura"      value={(p.costo_infraestructura_mensual ?? 0) === 0 ? 'Incluido año 1' : `${fmt(p.costo_infraestructura_mensual)}/mes`} accent={T.teal} />
                <CostCard label="Tiempo estimado"      value={p.timeline_semanas ? `${Math.min(p.timeline_semanas, 7)} semanas` : '—'} accent="#BA7517" />
              </>
            )
          })()}
        </div>

        {p.desglose_costos && p.desglose_costos.length > 0 && (
          <Section title="💰 Desglose de costos">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.cardBorder}` }}>
                  <th style={{ textAlign: 'left', padding: '6px 0', color: T.navy, fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Concepto</th>
                  <th style={{ textAlign: 'center', padding: '6px 0', color: T.navy, fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Tipo</th>
                  <th style={{ textAlign: 'right', padding: '6px 0', color: T.navy, fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Costo</th>
                </tr>
              </thead>
              <tbody>
                {p.desglose_costos.map((d, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
                    <td style={{ padding: '8px 0', color: T.carbon }}>{d.concepto}</td>
                    <td style={{ padding: '8px 0', textAlign: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                        background: d.tipo === 'unico' ? 'rgba(24,95,165,0.1)' : d.tipo === 'mensual' ? 'rgba(29,158,117,0.1)' : d.tipo === 'incluido' ? 'rgba(108,117,125,0.1)' : d.tipo === 'opcional' ? 'rgba(186,117,23,0.1)' : 'rgba(186,117,23,0.1)',
                        color: d.tipo === 'unico' ? T.blue : d.tipo === 'mensual' ? T.teal : d.tipo === 'incluido' ? '#6C757D' : d.tipo === 'opcional' ? '#BA7517' : '#BA7517',
                      }}>{d.tipo === 'unico' ? 'Único' : d.tipo === 'mensual' ? 'Mensual' : d.tipo === 'incluido' ? 'Incluido' : d.tipo === 'opcional' ? 'Opcional' : 'Anual'}</span>
                    </td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600, color: d.tipo === 'incluido' ? T.teal : d.tipo === 'opcional' ? '#BA7517' : T.navy }}>
                      {d.tipo === 'incluido' ? 'Incluido primer año ✓' : d.monto_min === d.monto_max ? fmt(d.monto_min) : `${fmt(d.monto_min)} – ${fmt(d.monto_max)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {p.soporte_recomendado && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(29,158,117,0.06)', border: `1px solid rgba(29,158,117,0.15)`, borderRadius: 8 }}>
                <p style={{ fontSize: 12, color: T.teal, fontWeight: 700, margin: '0 0 4px' }}>
                  🛠 Soporte técnico recomendado: {soportePrecio}
                </p>
                <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>
                  Incluye {p.revisiones_incluidas ?? 2} rondas de revisión gratuitas. Cambios adicionales: {extraRate}. Sujetos a evaluación previa.
                </p>
              </div>
            )}
          </Section>
        )}

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
              <span key={i} style={{ background: 'rgba(24,95,165,0.1)', color: T.blue, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, border: `1px solid rgba(24,95,165,0.2)` }}>{tech}</span>
            ))}
          </div>
        </Section>

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

        <Section title="🛡 Garantía y soporte">
          <p style={{ fontSize: 13, color: T.carbon, lineHeight: 1.6, marginBottom: 10 }}>
            <strong>Garantía de 30 días</strong> — La garantía cubre únicamente errores de código, funcionalidades pendientes del alcance acordado y fallas de sistema. No incluye cambios de diseño, nuevas funcionalidades ni contenido modificado tras la entrega.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 13, color: T.textMuted }}>• Soporte bajo demanda: <strong style={{ color: T.carbon }}>$300 MXN/hora</strong></div>
            <div style={{ fontSize: 13, color: T.textMuted }}>• El código es <strong style={{ color: T.carbon }}>100% tuyo</strong> al liquidar</div>
            <div style={{ fontSize: 13, color: T.textMuted }}>• Renovación desde año 2: hosting + dominio según plan elegido</div>
          </div>
        </Section>

        {(() => {
          const base    = Number(p.costo_minimo) || 0
          const ivaPct  = Number(p.iva_porcentaje) || 16
          const iva     = Math.round(base * (ivaPct / 100))
          const total   = base + iva
          const anticipo = Math.round(total * 0.5)
          const saldo    = total - anticipo
          return (
            <Section title="🧾 Desglose">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: T.carbon }}><span>Subtotal (sin IVA)</span><strong>{fmt(base)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: T.carbon }}><span>IVA {ivaPct}%</span><strong>{fmt(iva)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: T.navy, borderTop: `1px solid ${T.cardBorder}`, paddingTop: 6 }}><span><b>Total con IVA</b></span><strong>{fmt(total)}</strong></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                  <div style={{ background: 'rgba(24,95,165,0.06)', borderRadius: 8, padding: '8px 12px' }}>
                    <p style={{ fontSize: 10, color: T.textMuted, margin: '0 0 2px', textTransform: 'uppercase' }}>Anticipo al iniciar (50%)</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: T.blue, margin: 0 }}>{fmt(anticipo)}</p>
                  </div>
                  <div style={{ background: 'rgba(12,45,78,0.06)', borderRadius: 8, padding: '8px 12px' }}>
                    <p style={{ fontSize: 10, color: T.textMuted, margin: '0 0 2px', textTransform: 'uppercase' }}>Saldo al entregar (50%)</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: T.navy, margin: 0 }}>{fmt(saldo)}</p>
                  </div>
                </div>
              </div>
            </Section>
          )
        })()}

        <div style={{ background: T.bone, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '14px 20px' }}>
          <p style={{ fontSize: 12, color: T.textMuted, margin: 0, lineHeight: 1.6 }}>
            Vigencia de esta propuesta: <strong>15 días naturales</strong>. Los precios pueden variar si el alcance del proyecto es modificado por el cliente. Precios en MXN. IVA 16% desglosado al momento de cada pago.{' '}
            devmark · Guadalajara, Jalisco, México · devmark.mx
          </p>
        </div>
      </div>

      {/* ── VISTA IMPRESIÓN: flujo natural — el browser pagina automáticamente ── */}
      {/* Oculto en pantalla via CSS (.propuesta-print), visible solo en @media print  */}
      <div className="propuesta-print">

        {/* Encabezado — se repite en cada página vía CSS (position: running) */}
        <div className="print-running-header">
          <PrintHeader fecha={fechaFormateada} hora={horaFormateada} />
        </div>

        {/* Contenido: fluye libremente, el browser corta donde necesite */}
        <div className="print-body">

          <div className="print-block" style={{ background: T.navy, borderRadius: 10, padding: '18px 22px', color: '#fff' }}>
            <div style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Propuesta para</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{businessName}</div>
            <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>devmark — {fechaFormateada}</div>
          </div>

          <div className="print-block">
            <Section title="📋 Diagnóstico">
              <p style={{ fontSize: 13, color: T.carbon, lineHeight: 1.7 }}>{p.diagnostico_resumen}</p>
            </Section>
          </div>

          <div className="print-block">
            <Section title="💡 Solución propuesta">
              <p style={{ fontSize: 13, color: T.carbon, lineHeight: 1.7 }}>{p.solucion_propuesta}</p>
            </Section>
          </div>

          {p.factor_complejidad && (
            <div className="print-block" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99,
              background: p.factor_complejidad === 'basico' ? 'rgba(29,158,117,0.1)' : p.factor_complejidad === 'estandar' ? 'rgba(24,95,165,0.1)' : 'rgba(186,117,23,0.1)',
              border: `1px solid ${p.factor_complejidad === 'basico' ? 'rgba(29,158,117,0.25)' : p.factor_complejidad === 'estandar' ? 'rgba(24,95,165,0.25)' : 'rgba(186,117,23,0.25)'}`,
            }}>
              <span style={{ fontSize: 10, fontWeight: 700,
                color: p.factor_complejidad === 'basico' ? T.teal : p.factor_complejidad === 'estandar' ? T.blue : '#BA7517',
              }}>Complejidad: {p.factor_complejidad === 'basico' ? 'Básico' : p.factor_complejidad === 'estandar' ? 'Estándar' : 'Premium'}</span>
            </div>
          )}

          <div className="print-block" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {(() => {
              const ivaMult  = 1 + (Number(p.iva_porcentaje) || 16) / 100
              const minTotal = Math.round((Number(p.costo_minimo) || 0) * ivaMult)
              const maxTotal = Math.round((Number(p.costo_maximo) || 0) * ivaMult)
              const anticipo = Math.round(minTotal * 0.5)
              return (
                <>
                  <CostCard label="Inversión (c/IVA)"  value={`${fmt(minTotal)} – ${fmt(maxTotal)}`}               accent={T.navy} />
                  <CostCard label="Anticipo (50%)"       value={fmt(anticipo)}                                     accent={T.blue} />
                  <CostCard label="Infraestructura"      value={(p.costo_infraestructura_mensual ?? 0) === 0 ? 'Incluido año 1' : `${fmt(p.costo_infraestructura_mensual)}/mes`} accent={T.teal} />
                  <CostCard label="Tiempo estimado"      value={p.timeline_semanas ? `${Math.min(p.timeline_semanas, 7)} semanas` : '—'} accent="#BA7517" />
                </>
              )
            })()}
          </div>

          {p.desglose_costos && p.desglose_costos.length > 0 && (
            <div className="print-block">
              <Section title="💰 Desglose de costos">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${T.cardBorder}` }}>
                      <th style={{ textAlign: 'left', padding: '5px 0', color: T.navy, fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>Concepto</th>
                      <th style={{ textAlign: 'center', padding: '5px 0', color: T.navy, fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>Tipo</th>
                      <th style={{ textAlign: 'right', padding: '5px 0', color: T.navy, fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.desglose_costos.map((d, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
                        <td style={{ padding: '6px 0', color: T.carbon }}>{d.concepto}</td>
                        <td style={{ padding: '6px 0', textAlign: 'center' }}>
                          <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 99,
                            background: d.tipo === 'unico' ? 'rgba(24,95,165,0.1)' : d.tipo === 'mensual' ? 'rgba(29,158,117,0.1)' : d.tipo === 'incluido' ? 'rgba(108,117,125,0.1)' : d.tipo === 'opcional' ? 'rgba(186,117,23,0.1)' : 'rgba(186,117,23,0.1)',
                            color: d.tipo === 'unico' ? T.blue : d.tipo === 'mensual' ? T.teal : d.tipo === 'incluido' ? '#6C757D' : d.tipo === 'opcional' ? '#BA7517' : '#BA7517',
                          }}>{d.tipo === 'unico' ? 'Único' : d.tipo === 'mensual' ? 'Mensual' : d.tipo === 'incluido' ? 'Incluido' : d.tipo === 'opcional' ? 'Opcional' : 'Anual'}</span>
                        </td>
                        <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600, color: d.tipo === 'incluido' ? T.teal : d.tipo === 'opcional' ? '#BA7517' : T.navy }}>
                          {d.tipo === 'incluido' ? 'Incluido primer año ✓' : d.monto_min === d.monto_max ? fmt(d.monto_min) : `${fmt(d.monto_min)} – ${fmt(d.monto_max)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {p.soporte_recomendado && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(29,158,117,0.06)', border: `1px solid rgba(29,158,117,0.15)`, borderRadius: 8 }}>
                    <p style={{ fontSize: 11, color: T.teal, fontWeight: 700, margin: '0 0 2px' }}>🛠 Soporte recomendado: {soportePrecio}</p>
                    <p style={{ fontSize: 10, color: T.textMuted, margin: 0 }}>Cambios extra: {extraRate}</p>
                  </div>
                )}
              </Section>
            </div>
          )}

          <div className="print-block">
            <Section title="🛠 Stack tecnológico">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {p.stack_tecnologico?.map((tech, i) => (
                  <span key={i} style={{ background: 'rgba(24,95,165,0.1)', color: T.blue, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, border: `1px solid rgba(24,95,165,0.2)` }}>{tech}</span>
                ))}
              </div>
            </Section>
          </div>

          <div className="print-block" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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

          <div className="print-block">
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
          </div>

          <div className="print-block">
            <Section title="🛡 Garantía y soporte">
              <p style={{ fontSize: 13, color: T.carbon, lineHeight: 1.6, marginBottom: 8 }}>
                <strong>Garantía de 30 días</strong> — La garantía cubre únicamente errores de código, funcionalidades pendientes del alcance acordado y fallas de sistema. No incluye cambios de diseño, nuevas funcionalidades ni contenido modificado tras la entrega.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 12, color: T.textMuted }}>• Soporte bajo demanda: <strong style={{ color: T.carbon }}>$300 MXN/hora</strong></div>
                <div style={{ fontSize: 12, color: T.textMuted }}>• El código es <strong style={{ color: T.carbon }}>100% tuyo</strong> al liquidar</div>
                <div style={{ fontSize: 12, color: T.textMuted }}>• Renovación desde año 2: hosting + dominio según plan elegido</div>
              </div>
            </Section>
          </div>

          {(() => {
            const base     = Number(p.costo_minimo) || 0
            const ivaPct   = Number(p.iva_porcentaje) || 16
            const iva      = Math.round(base * (ivaPct / 100))
            const total    = base + iva
            const anticipo = Math.round(total * 0.5)
            const saldo    = total - anticipo
            return (
              <div className="print-block">
                <Section title="🧾 Desglose">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.carbon }}><span>Subtotal (sin IVA)</span><strong>{fmt(base)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.carbon }}><span>IVA {ivaPct}%</span><strong>{fmt(iva)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: T.navy, borderTop: `1px solid ${T.cardBorder}`, paddingTop: 5 }}><span><b>Total con IVA</b></span><strong>{fmt(total)}</strong></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                      <div style={{ background: 'rgba(24,95,165,0.06)', borderRadius: 8, padding: '7px 10px' }}>
                        <p style={{ fontSize: 9, color: T.textMuted, margin: '0 0 2px', textTransform: 'uppercase' }}>Anticipo al iniciar (50%)</p>
                        <p style={{ fontSize: 13, fontWeight: 800, color: T.blue, margin: 0 }}>{fmt(anticipo)}</p>
                      </div>
                      <div style={{ background: 'rgba(12,45,78,0.06)', borderRadius: 8, padding: '7px 10px' }}>
                        <p style={{ fontSize: 9, color: T.textMuted, margin: '0 0 2px', textTransform: 'uppercase' }}>Saldo al entregar (50%)</p>
                        <p style={{ fontSize: 13, fontWeight: 800, color: T.navy, margin: 0 }}>{fmt(saldo)}</p>
                      </div>
                    </div>
                  </div>
                </Section>
              </div>
            )
          })()}

          <div className="print-block print-footer-block" style={{ background: T.bone, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '14px 20px' }}>
            <p style={{ fontSize: 11, color: T.textMuted, margin: 0, lineHeight: 1.6 }}>
              Vigencia de esta propuesta: <strong>15 días naturales</strong>. Los precios pueden variar si el alcance del proyecto es modificado por el cliente. Precios en MXN. IVA 16% desglosado al momento de cada pago.{' '}
              devmark · Guadalajara, Jalisco, México · devmark.mx
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
