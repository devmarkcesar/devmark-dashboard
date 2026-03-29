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
