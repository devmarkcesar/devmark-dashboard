import pool from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const seqAgentId = body?.seqAgentId

  if (!seqAgentId || typeof seqAgentId !== 'number') {
    return NextResponse.json({ error: 'seqAgentId requerido' }, { status: 400 })
  }

  await pool.query('DELETE FROM chat_history WHERE agent_id = $1', [seqAgentId])
  return NextResponse.json({ ok: true })
}
