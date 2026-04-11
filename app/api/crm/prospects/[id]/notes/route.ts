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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const prospectId = Number(id)
  if (isNaN(prospectId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const b = await req.json().catch(() => null)
  const noteId = Number(b?.note_id)
  if (isNaN(noteId) || noteId <= 0) return NextResponse.json({ error: 'note_id inválido' }, { status: 400 })

  // Validar que la nota pertenece a este prospecto (seguridad: evita eliminar notas de otros prospectos)
  const { rowCount } = await pool.query(
    'DELETE FROM prospect_notes WHERE id = $1 AND prospect_id = $2',
    [noteId, prospectId]
  )

  if (!rowCount) return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
