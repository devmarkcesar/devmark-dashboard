import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const seqAgentId = body?.seqAgentId

  if (!seqAgentId || typeof seqAgentId !== 'number') {
    return NextResponse.json({ error: 'seqAgentId requerido' }, { status: 400 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY no configurada' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { persistSession: false } }
  )

  const { error } = await supabase
    .from('chat_history')
    .delete()
    .eq('agent_id', seqAgentId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Limpiar también el resumen de memoria comprimida
  await supabase.from('memory_summaries').delete().eq('agent_id', seqAgentId)

  return NextResponse.json({ ok: true })
}
