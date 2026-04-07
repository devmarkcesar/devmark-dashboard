import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import pool from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const prospectId = Number(id)
  if (isNaN(prospectId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const b = await req.json().catch(() => null)
  const content = (b?.content ?? '').toString().trim()
  if (!content) return NextResponse.json({ error: 'content requerido' }, { status: 400 })

  const { rows } = await pool.query(
    'INSERT INTO prospect_notes (prospect_id, content) VALUES ($1, $2) RETURNING *',
    [prospectId, content]
  )

  await pool.query('UPDATE prospects SET updated_at = NOW() WHERE id = $1', [prospectId])

  return NextResponse.json(rows[0], { status: 201 })
}
