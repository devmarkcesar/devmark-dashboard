import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import pool from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { rows } = await pool.query(`
    SELECT
      p.*,
      COALESCE(
        json_agg(n ORDER BY n.created_at DESC) FILTER (WHERE n.id IS NOT NULL),
        '[]'
      ) AS notes
    FROM prospects p
    LEFT JOIN prospect_notes n ON n.prospect_id = p.id
    GROUP BY p.id
    ORDER BY p.updated_at DESC
  `)

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const b = await req.json().catch(() => null)
  if (!b?.contact_name || !b?.business_name) {
    return NextResponse.json({ error: 'contact_name y business_name son requeridos' }, { status: 400 })
  }

  const { rows } = await pool.query(`
    INSERT INTO prospects
      (contact_name, contact_role, business_name, business_type, phone, email,
       neighborhood, city, service_type, pipeline, quote_amount, delivery_days,
       visit_date, followup_date, loss_reason)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    RETURNING *
  `, [
    b.contact_name, b.contact_role ?? '',
    b.business_name, b.business_type ?? '',
    b.phone ?? '', b.email ?? '',
    b.neighborhood ?? '', b.city ?? '',
    b.service_type ?? '', b.pipeline ?? 'Visitado',
    b.quote_amount ?? null, b.delivery_days ?? null,
    b.visit_date ?? null, b.followup_date ?? null,
    b.loss_reason ?? '',
  ])

  return NextResponse.json({ ...rows[0], notes: [] }, { status: 201 })
}
