import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import pool from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const prospectId = Number(id)
  if (isNaN(prospectId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const b = await req.json().catch(() => null)
  if (!b) return NextResponse.json({ error: 'Body requerido' }, { status: 400 })

  const { rows } = await pool.query(`
    UPDATE prospects SET
      contact_name  = COALESCE($1, contact_name),
      contact_role  = COALESCE($2, contact_role),
      business_name = COALESCE($3, business_name),
      business_type = COALESCE($4, business_type),
      phone         = COALESCE($5, phone),
      email         = COALESCE($6, email),
      neighborhood  = COALESCE($7, neighborhood),
      city          = COALESCE($8, city),
      service_type  = COALESCE($9, service_type),
      pipeline      = COALESCE($10, pipeline),
      quote_amount  = COALESCE($11, quote_amount),
      delivery_days = COALESCE($12, delivery_days),
      visit_date    = COALESCE($13, visit_date),
      followup_date = COALESCE($14, followup_date),
      loss_reason   = COALESCE($15, loss_reason),
      updated_at    = NOW()
    WHERE id = $16
    RETURNING *
  `, [
    b.contact_name ?? null, b.contact_role ?? null,
    b.business_name ?? null, b.business_type ?? null,
    b.phone ?? null, b.email ?? null,
    b.neighborhood ?? null, b.city ?? null,
    b.service_type ?? null, b.pipeline ?? null,
    b.quote_amount ?? null, b.delivery_days ?? null,
    b.visit_date ?? null, b.followup_date ?? null,
    b.loss_reason ?? null,
    prospectId,
  ])

  if (!rows[0]) return NextResponse.json({ error: 'Prospecto no encontrado' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const prospectId = Number(id)
  if (isNaN(prospectId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  await pool.query('DELETE FROM prospects WHERE id = $1', [prospectId])
  return NextResponse.json({ ok: true })
}
