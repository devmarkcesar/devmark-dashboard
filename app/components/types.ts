// ─── Types compartidos devmark ────────────────────────────────────────────────
export interface Agent {
  id: number
  name: string
  category: string
  icon: string
  status: string
  tasks_done: number
  last_active: string
  prompt?: string
}
export interface Project {
  id: string
  name: string
  jira_key: string
  status: string
  created_at: string
}
export interface Task {
  id: string
  jira_key: string
  title: string
  agent_name: string
  status: string
  priority: string
  created_at: string
}
export interface Log {
  id: number
  agent_name: string
  message: string
  level: string
  timestamp: string
}

export type PipelineStage =
  | 'Visitado'
  | 'Interesado'
  | 'Propuesta enviada'
  | 'Negociando'
  | 'Cerrado'
  | 'Perdido'
  | 'En desarrollo'
  | 'Entregado'

export interface ProspectNote {
  id: number
  prospect_id: number
  content: string
  created_at: string
}

export interface Prospect {
  id: number
  contact_name: string
  contact_role: string
  business_name: string
  business_type: string
  phone: string
  email: string
  neighborhood: string
  city: string
  service_type: string
  pipeline: PipelineStage
  quote_amount: number | null
  delivery_days: number | null
  visit_date: string | null
  followup_date: string | null
  loss_reason: string
  notes: ProspectNote[]
  created_at: string
  updated_at: string
}
