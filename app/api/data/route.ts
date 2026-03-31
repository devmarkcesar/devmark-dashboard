import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import pool from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [agents, projects, tasks, logs] = await Promise.all([
    pool.query('SELECT * FROM agents ORDER BY id'),
    pool.query('SELECT * FROM projects ORDER BY created_at DESC'),
    pool.query('SELECT * FROM tasks ORDER BY created_at DESC'),
    pool.query('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50'),
  ])

  return NextResponse.json({
    agents:   agents.rows,
    projects: projects.rows,
    tasks:    tasks.rows,
    logs:     logs.rows,
  })
}
