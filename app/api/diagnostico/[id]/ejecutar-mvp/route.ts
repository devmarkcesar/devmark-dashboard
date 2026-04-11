import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const CORE_API_URL = process.env.CORE_API_URL!;
const CORE_SECRET  = process.env.CORE_SECRET!;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;

  const res = await fetch(`${CORE_API_URL}/diagnostico/${id}/ejecutar-mvp`, {
    method: "POST",
    headers: { "x-api-secret": CORE_SECRET },
    signal: AbortSignal.timeout(120_000),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
