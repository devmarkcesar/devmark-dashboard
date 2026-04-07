'use client'
import React from 'react'
import { T } from './tokens'

export interface Propuesta {
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

export function ProspuestaView({ p, businessName }: { p: Propuesta; businessName: string }) {
  const now = new Date()
  const fechaFormateada = now.toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const horaFormateada = now.toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header de impresión — solo visible al imprimir, se repite en cada hoja */}
      <div className="print-page-header" style={{ display: 'none' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/horizontal/dev-hori-1.png" alt="devmark" style={{ height: 36, objectFit: 'contain' }} />
        <div style={{ textAlign: 'right', fontSize: 10, color: '#555', lineHeight: 1.5 }}>
          <div style={{ fontWeight: 700, color: '#0C2D4E' }}>Guadalajara, Jalisco</div>
          <div>{fechaFormateada} · {horaFormateada}</div>
        </div>
      </div>

      {/* Encabezado */}
      <div style={{ background: T.navy, borderRadius: 10, padding: '20px 24px', color: '#fff' }}>
        <div style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Propuesta para</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{businessName}</div>
        <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>
          devmark — {fechaFormateada}
        </div>
      </div>

      <Section title="📋 Diagnóstico">
        <p style={{ fontSize: 14, color: T.carbon, lineHeight: 1.7 }}>{p.diagnostico_resumen}</p>
      </Section>

      <Section title="💡 Solución propuesta">
        <p style={{ fontSize: 14, color: T.carbon, lineHeight: 1.7 }}>{p.solucion_propuesta}</p>
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        <CostCard label="Inversión"       value={`${fmt(p.costo_minimo)} – ${fmt(p.costo_maximo)}`}          accent={T.navy} />
        <CostCard label="Anticipo (50%)"  value={fmt(p.anticipo || Math.round(p.costo_minimo * 0.5))}        accent={T.blue} />
        <CostCard label="Infraestructura" value={`${fmt(p.costo_infraestructura_mensual)}/mes`}              accent={T.teal} />
        <CostCard label="Tiempo estimado" value={`${p.timeline_semanas} semanas`}                            accent="#BA7517" />
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

      <div style={{ background: T.bone, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '16px 20px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>📋 Condiciones comerciales</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div style={{ background: '#fff', border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 3px' }}>Anticipo al iniciar (50%)</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: T.blue, margin: 0 }}>{fmt(p.anticipo || Math.round(p.costo_minimo * 0.5))}</p>
          </div>
          <div style={{ background: '#fff', border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 3px' }}>Saldo al entregar (50%)</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: T.navy, margin: 0 }}>{fmt(p.anticipo || Math.round(p.costo_minimo * 0.5))}</p>
          </div>
        </div>
        <p style={{ fontSize: 12, color: T.textMuted, margin: 0, lineHeight: 1.6 }}>
          Vigencia de esta propuesta: <strong>15 días naturales</strong>.
          Los precios pueden variar si el alcance del proyecto es modificado por el cliente.
          devmark · Guadalajara, Jalisco · devmark.mx
        </p>
      </div>
    </div>
  )
}
