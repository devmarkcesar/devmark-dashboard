import pool from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const agentId = Number(id)
  if (isNaN(agentId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const [agentRes, historyRes] = await Promise.all([
    pool.query('SELECT * FROM agents WHERE id = $1', [agentId]),
    pool.query(
      'SELECT id, agent_id, role, content, created_at FROM chat_history WHERE agent_id = $1 ORDER BY created_at ASC',
      [agentId]
    ),
  ])

  return NextResponse.json({
    agent:   agentRes.rows[0] ?? null,
    history: historyRes.rows,
  })
}
