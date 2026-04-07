'use client'
import { useState } from 'react'
import { T } from './tokens'
import { Panel, PanelTitle, StatCard } from './ui'
import type { Prospect, PipelineStage, ProspectNote } from './types'

// ─── Constantes ───────────────────────────────────────────────────────────────
const PIPELINE_STAGES: PipelineStage[] = [
  'Visitado', 'Interesado', 'Propuesta enviada', 'Negociando',
  'Cerrado', 'Perdido', 'En desarrollo', 'Entregado',
]

const SERVICE_TYPES = [
  'Sitio web', 'Sistema', 'Automatización', 'Bot', 'Dashboard',
]

const PIPELINE_COLOR: Record<string, string> = {
  'Visitado':          '#8A8A87',
  'Interesado':        T.blue,
  'Propuesta enviada': '#BA7517',
  'Negociando':        '#7B3FB5',
  'Cerrado':           T.teal,
  'Perdido':           '#C05621',
  'En desarrollo':     '#185FA5',
  'Entregado':         '#1D9E75',
}

// ─── Form vacío ───────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  contact_name: '', contact_role: '',
  business_name: '', business_type: '',
  phone: '', email: '',
  neighborhood: '', city: '',
  service_type: '', pipeline: 'Visitado' as PipelineStage,
  quote_amount: '', delivery_days: '',
  visit_date: '', followup_date: '',
  loss_reason: '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt$  (n: number | null) { if (!n) return '—'; return '$' + n.toLocaleString('es-MX') }
function fmtDate(s: string | null) { if (!s) return '—'; return new Date(s).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) }

function startOfWeek() {
  const d = new Date(); d.setHours(0,0,0,0)
  d.setDate(d.getDate() - d.getDay()); return d
}

// ─── PipelineBadge ────────────────────────────────────────────────────────────
function PipelineBadge({ stage }: { stage: string }) {
  const color = PIPELINE_COLOR[stage] ?? T.textMuted
  return (
    <span style={{
      fontSize: 9, padding: '2px 9px', borderRadius: 99, fontWeight: 700,
      background: `${color}18`, color, whiteSpace: 'nowrap',
      border: `1px solid ${color}30`,
    }}>{stage}</span>
  )
}

// ─── Form fields helper ───────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: T.carbon, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      {children}
    </div>
  )
}

const INPUT_STYLE: React.CSSProperties = {
  fontSize: 12, padding: '7px 10px', borderRadius: 7,
  border: `1.5px solid ${T.cardBorder}`, background: '#fff',
  color: T.navy, outline: 'none', width: '100%',
}

// ─── ProspectForm ─────────────────────────────────────────────────────────────
function ProspectForm({
  initial, onSave, onCancel, saving,
}: {
  initial: typeof EMPTY_FORM
  onSave: (data: typeof EMPTY_FORM) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div style={{
      background: T.bone, border: `1.5px solid ${T.cardBorder}`, borderRadius: 12,
      padding: 20, marginBottom: 16,
    }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {initial.contact_name ? 'Editar prospecto' : 'Nuevo prospecto'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
        <Field label="Nombre contacto *">
          <input style={INPUT_STYLE} value={form.contact_name} onChange={set('contact_name')} placeholder="Ej. Juan Pérez" />
        </Field>
        <Field label="Cargo">
          <input style={INPUT_STYLE} value={form.contact_role} onChange={set('contact_role')} placeholder="Ej. Dueño, Gerente..." />
        </Field>
        <Field label="Negocio *">
          <input style={INPUT_STYLE} value={form.business_name} onChange={set('business_name')} placeholder="Nombre del negocio" />
        </Field>
        <Field label="Tipo de negocio">
          <input style={INPUT_STYLE} value={form.business_type} onChange={set('business_type')} placeholder="Ej. Restaurante, Clínica..." />
        </Field>
        <Field label="Teléfono">
          <input style={INPUT_STYLE} value={form.phone} onChange={set('phone')} placeholder="+52 33 ..." type="tel" />
        </Field>
        <Field label="Correo">
          <input style={INPUT_STYLE} value={form.email} onChange={set('email')} placeholder="correo@empresa.com" type="email" />
        </Field>
        <Field label="Colonia">
          <input style={INPUT_STYLE} value={form.neighborhood} onChange={set('neighborhood')} placeholder="Ej. Providencia" />
        </Field>
        <Field label="Ciudad">
          <input style={INPUT_STYLE} value={form.city} onChange={set('city')} placeholder="Ej. Guadalajara" />
        </Field>
        <Field label="Servicio">
          <select style={INPUT_STYLE} value={form.service_type} onChange={set('service_type')}>
            <option value="">— Seleccionar —</option>
            {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Pipeline">
          <select style={INPUT_STYLE} value={form.pipeline} onChange={set('pipeline')}>
            {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Cotización ($)">
          <input style={INPUT_STYLE} value={form.quote_amount} onChange={set('quote_amount')} placeholder="Ej. 12000" type="number" min="0" />
        </Field>
        <Field label="Entrega (días)">
          <input style={INPUT_STYLE} value={form.delivery_days} onChange={set('delivery_days')} placeholder="Ej. 30" type="number" min="0" />
        </Field>
        <Field label="Fecha de visita">
          <input style={INPUT_STYLE} value={form.visit_date} onChange={set('visit_date')} type="date" />
        </Field>
        <Field label="Seguimiento">
          <input style={INPUT_STYLE} value={form.followup_date} onChange={set('followup_date')} type="date" />
        </Field>
      </div>

      {form.pipeline === 'Perdido' && (
        <Field label="Motivo de pérdida">
          <textarea
            style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: 60 }}
            value={form.loss_reason} onChange={set('loss_reason')}
            placeholder="¿Por qué se perdió este prospecto?"
          />
        </Field>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.contact_name.trim() || !form.business_name.trim()}
          style={{
            fontSize: 12, padding: '8px 18px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: T.teal, color: '#fff', fontWeight: 700,
            opacity: (!form.contact_name.trim() || !form.business_name.trim()) ? 0.5 : 1,
          }}
        >{saving ? 'Guardando...' : 'Guardar'}</button>
        <button
          onClick={onCancel}
          style={{ fontSize: 12, padding: '8px 18px', borderRadius: 7, border: `1px solid ${T.cardBorder}`, cursor: 'pointer', background: 'transparent', color: T.carbon }}
        >Cancelar</button>
      </div>
    </div>
  )
}

// ─── ProspectRow ──────────────────────────────────────────────────────────────
function ProspectRow({
  p, onEdit, onDelete, onAddNote, onPipelineChange,
}: {
  p: Prospect
  onEdit: () => void
  onDelete: () => void
  onAddNote: (content: string) => void
  onPipelineChange: (stage: PipelineStage) => void
}) {
  const [expanded,  setExpanded]  = useState(false)
  const [note,      setNote]      = useState('')
  const [addingNote, setAddingNote] = useState(false)

  async function submitNote() {
    if (!note.trim()) return
    setAddingNote(true)
    await onAddNote(note.trim())
    setNote('')
    setAddingNote(false)
  }

  return (
    <div style={{ border: `1px solid ${T.cardBorder}`, borderRadius: 10, marginBottom: 8, background: '#fff', overflow: 'hidden' }}>
      {/* Fila principal */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', cursor: 'pointer', flexWrap: 'wrap' }}
        onClick={() => setExpanded(e => !e)}
      >
        <span style={{ fontSize: 15, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', color: T.textMuted }}>▶</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.navy, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {p.business_name}
          </p>
          <p style={{ fontSize: 11, color: T.carbon, margin: 0, opacity: 0.7 }}>
            {p.contact_name}{p.contact_role ? ` · ${p.contact_role}` : ''}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {p.service_type && (
            <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, background: `${T.blue}12`, color: T.blue, fontWeight: 700 }}>
              {p.service_type}
            </span>
          )}
          <PipelineBadge stage={p.pipeline} />
          {p.quote_amount && (
            <span style={{ fontSize: 11, fontWeight: 700, color: T.teal }}>{fmt$(p.quote_amount)}</span>
          )}
          {p.followup_date && (
            <span style={{ fontSize: 10, color: T.textMuted }}>↻ {fmtDate(p.followup_date)}</span>
          )}
        </div>
      </div>

      {/* Detalle expandible */}
      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${T.cardBorder}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, padding: '12px 0' }}>
            {p.phone    && <div><p style={LABEL_S}>Teléfono</p><p style={VAL_S}>{p.phone}</p></div>}
            {p.email    && <div><p style={LABEL_S}>Correo</p><p style={VAL_S}>{p.email}</p></div>}
            {p.city     && <div><p style={LABEL_S}>Ciudad</p><p style={VAL_S}>{p.city}{p.neighborhood ? ` · ${p.neighborhood}` : ''}</p></div>}
            {p.delivery_days && <div><p style={LABEL_S}>Entrega</p><p style={VAL_S}>{p.delivery_days} días</p></div>}
            {p.visit_date    && <div><p style={LABEL_S}>Visita</p><p style={VAL_S}>{fmtDate(p.visit_date)}</p></div>}
            {p.followup_date && <div><p style={LABEL_S}>Seguimiento</p><p style={VAL_S}>{fmtDate(p.followup_date)}</p></div>}
          </div>

          {p.pipeline === 'Perdido' && p.loss_reason && (
            <p style={{ fontSize: 11, color: '#C05621', background: 'rgba(192,86,33,0.07)', borderRadius: 7, padding: '6px 10px', marginBottom: 10 }}>
              <strong>Motivo pérdida:</strong> {p.loss_reason}
            </p>
          )}

          {/* Cambiar pipeline rápido */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={{ fontSize: 10, color: T.textMuted, alignSelf: 'center', marginRight: 4 }}>Mover a:</span>
            {PIPELINE_STAGES.filter(s => s !== p.pipeline).map(s => (
              <button
                key={s}
                onClick={e => { e.stopPropagation(); onPipelineChange(s) }}
                style={{
                  fontSize: 9, padding: '3px 9px', borderRadius: 99, border: `1px solid ${PIPELINE_COLOR[s]}44`,
                  background: `${PIPELINE_COLOR[s]}10`, color: PIPELINE_COLOR[s], cursor: 'pointer', fontWeight: 700,
                }}
              >{s}</button>
            ))}
          </div>

          {/* Notas / actividad */}
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.carbon, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Actividad</p>
            {p.notes.length === 0 ? (
              <p style={{ fontSize: 11, color: T.textMuted, fontStyle: 'italic' }}>Sin notas aún.</p>
            ) : p.notes.map((n: ProspectNote) => (
              <div key={n.id} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: `1px solid ${T.cardBorder}` }}>
                <span style={{ fontSize: 10, color: T.textMuted, whiteSpace: 'nowrap', marginTop: 1 }}>{fmtDate(n.created_at)}</span>
                <span style={{ fontSize: 11, color: T.carbon }}>{n.content}</span>
              </div>
            ))}
          </div>

          {/* Agregar nota */}
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitNote()}
              placeholder="Agregar nota de seguimiento..."
              style={{ flex: 1, ...INPUT_STYLE, fontSize: 11 }}
            />
            <button
              onClick={e => { e.stopPropagation(); submitNote() }}
              disabled={!note.trim() || addingNote}
              style={{
                fontSize: 11, padding: '6px 12px', borderRadius: 7, border: 'none',
                background: T.blue, color: '#fff', cursor: note.trim() ? 'pointer' : 'not-allowed',
                fontWeight: 700, opacity: note.trim() ? 1 : 0.5,
              }}
            >{addingNote ? '...' : '+ Nota'}</button>
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={e => { e.stopPropagation(); onEdit() }}
              style={{ fontSize: 11, padding: '5px 14px', borderRadius: 7, border: `1px solid ${T.cardBorder}`, background: 'transparent', color: T.navy, cursor: 'pointer' }}
            >✏ Editar</button>
            <button
              onClick={e => {
                e.stopPropagation()
                if (window.confirm(`¿Eliminar prospecto ${p.business_name}? No se puede deshacer.`)) onDelete()
              }}
              style={{ fontSize: 11, padding: '5px 14px', borderRadius: 7, border: '1px solid rgba(192,86,33,0.3)', background: 'rgba(192,86,33,0.06)', color: '#C05621', cursor: 'pointer' }}
            >🗑 Eliminar</button>
          </div>
        </div>
      )}
    </div>
  )
}

const LABEL_S: React.CSSProperties = { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: T.textMuted, margin: '0 0 2px' }
const VAL_S:   React.CSSProperties = { fontSize: 12, color: T.navy, margin: 0, fontWeight: 600 }

// ─── CRMTab principal ─────────────────────────────────────────────────────────
interface CRMTabProps {
  prospects: Prospect[]
  onProspectsChange: (ps: Prospect[]) => void
}

export function CRMTab({ prospects, onProspectsChange }: CRMTabProps) {
  const [pipelineFilter, setPipelineFilter] = useState<PipelineStage | 'Todos'>('Todos')
  const [showForm,  setShowForm]  = useState(false)
  const [editTarget, setEditTarget] = useState<Prospect | null>(null)
  const [saving,    setSaving]    = useState(false)

  // ─── Métricas ──────────────────────────────────────────────────────────────
  const week    = startOfWeek()
  const thisWeek = prospects.filter(p => new Date(p.created_at) >= week).length
  const closed  = prospects.filter(p => p.pipeline === 'Cerrado' || p.pipeline === 'Entregado').length
  const lost    = prospects.filter(p => p.pipeline === 'Perdido').length
  const closeRate = closed + lost > 0 ? Math.round((closed / (closed + lost)) * 100) : 0
  const pipelineValue = prospects
    .filter(p => !['Perdido', 'Entregado'].includes(p.pipeline))
    .reduce((s, p) => s + (p.quote_amount ?? 0), 0)
  const active = prospects.filter(p => p.pipeline === 'En desarrollo').length

  // ─── Filtro ─────────────────────────────────────────────────────────────────
  const visible = pipelineFilter === 'Todos'
    ? prospects
    : prospects.filter(p => p.pipeline === pipelineFilter)

  // ─── CRUD helpers ────────────────────────────────────────────────────────────
  async function handleSave(form: typeof EMPTY_FORM) {
    setSaving(true)
    try {
      const payload = {
        ...form,
        quote_amount:  form.quote_amount  ? Number(form.quote_amount)  : null,
        delivery_days: form.delivery_days ? Number(form.delivery_days) : null,
        visit_date:    form.visit_date    || null,
        followup_date: form.followup_date || null,
      }

      if (editTarget) {
        const res = await fetch(`/api/crm/prospects/${editTarget.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
        if (res.ok) {
          const updated = await res.json()
          onProspectsChange(prospects.map(p => p.id === editTarget.id ? { ...p, ...updated } : p))
        }
      } else {
        const res = await fetch('/api/crm/prospects', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
        if (res.ok) {
          const created = await res.json()
          onProspectsChange([created, ...prospects])
        }
      }
      setShowForm(false)
      setEditTarget(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/crm/prospects/${id}`, { method: 'DELETE' })
    onProspectsChange(prospects.filter(p => p.id !== id))
  }

  async function handleAddNote(prospectId: number, content: string) {
    const res = await fetch(`/api/crm/prospects/${prospectId}/notes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }),
    })
    if (res.ok) {
      const note = await res.json()
      onProspectsChange(prospects.map(p =>
        p.id === prospectId ? { ...p, notes: [note, ...p.notes] } : p
      ))
    }
  }

  async function handlePipelineChange(prospectId: number, stage: PipelineStage) {
    const res = await fetch(`/api/crm/prospects/${prospectId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pipeline: stage }),
    })
    if (res.ok) {
      onProspectsChange(prospects.map(p => p.id === prospectId ? { ...p, pipeline: stage } : p))
    }
  }

  const editInitial = editTarget ? {
    contact_name:  editTarget.contact_name,
    contact_role:  editTarget.contact_role,
    business_name: editTarget.business_name,
    business_type: editTarget.business_type,
    phone:         editTarget.phone,
    email:         editTarget.email,
    neighborhood:  editTarget.neighborhood,
    city:          editTarget.city,
    service_type:  editTarget.service_type,
    pipeline:      editTarget.pipeline,
    quote_amount:  editTarget.quote_amount?.toString() ?? '',
    delivery_days: editTarget.delivery_days?.toString() ?? '',
    visit_date:    editTarget.visit_date ?? '',
    followup_date: editTarget.followup_date ?? '',
    loss_reason:   editTarget.loss_reason,
  } : EMPTY_FORM

  return (
    <>
      {/* Métricas */}
      <div className="stats-grid" style={{ marginBottom: 16 }}>
        <StatCard label="Prospectos esta semana" value={thisWeek}  sub={`${prospects.length} totales`}      accent={T.blue} />
        <StatCard label="Tasa de cierre"          value={`${closeRate}%`} sub={`${closed} cerrados / ${lost} perdidos`} accent={T.teal} />
        <StatCard label="Valor en pipeline"       value={fmt$(pipelineValue)} sub="prospectos activos"         accent={T.blue} />
        <StatCard label="En desarrollo"           value={active}  sub="proyectos activos"                    accent={T.teal} />
      </div>

      <Panel>
        {/* Cabecera */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap', paddingBottom: 10, borderBottom: `1px solid ${T.cardBorder}` }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Prospectos CRM</p>
          <button
            onClick={() => { setShowForm(!showForm); setEditTarget(null) }}
            style={{
              marginLeft: 'auto', fontSize: 11, padding: '6px 14px', borderRadius: 7,
              border: 'none', background: T.teal, color: '#fff', cursor: 'pointer', fontWeight: 700,
            }}
          >+ Nuevo prospecto</button>
        </div>

        {/* Filtro pipeline */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
          {(['Todos', ...PIPELINE_STAGES] as const).map(stage => {
            const active = pipelineFilter === stage
            const color = stage === 'Todos' ? T.navy : PIPELINE_COLOR[stage]
            const count = stage === 'Todos' ? prospects.length : prospects.filter(p => p.pipeline === stage).length
            return (
              <button
                key={stage}
                onClick={() => setPipelineFilter(stage)}
                style={{
                  fontSize: 10, padding: '4px 11px', borderRadius: 99, cursor: 'pointer',
                  fontWeight: 700, border: 'none',
                  background: active ? `${color}18` : 'transparent',
                  color: active ? color : T.textMuted,
                  outline: active ? `1px solid ${color}40` : 'none',
                }}
              >{stage} {count > 0 && <span style={{ opacity: 0.6 }}>({count})</span>}</button>
            )
          })}
        </div>

        {/* Formulario */}
        {(showForm || editTarget) && (
          <ProspectForm
            initial={editInitial}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditTarget(null) }}
            saving={saving}
          />
        )}

        {/* Lista */}
        {visible.length === 0 ? (
          <p style={{ fontSize: 12, color: T.textMuted, textAlign: 'center', padding: '30px 0', fontStyle: 'italic' }}>
            {pipelineFilter === 'Todos' ? 'Sin prospectos aún. Agrega el primero.' : `Sin prospectos en "${pipelineFilter}".`}
          </p>
        ) : visible.map(p => (
          <ProspectRow
            key={p.id}
            p={p}
            onEdit={() => { setEditTarget(p); setShowForm(false) }}
            onDelete={() => handleDelete(p.id)}
            onAddNote={(content) => handleAddNote(p.id, content)}
            onPipelineChange={(stage) => handlePipelineChange(p.id, stage)}
          />
        ))}
      </Panel>
    </>
  )
}
