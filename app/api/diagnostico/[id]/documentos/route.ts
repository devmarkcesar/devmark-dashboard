import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const API_URL    = process.env.CORE_API_URL         ?? "http://127.0.0.1:8000";
const API_SECRET = process.env.DASHBOARD_API_SECRET ?? "";

/** POST /api/diagnostico/[id]/documentos?tipo=documentacion|imagen */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const tipo = req.nextUrl.searchParams.get("tipo") ?? "documentacion";

  if (tipo !== "documentacion" && tipo !== "imagen") {
    return NextResponse.json({ error: "tipo debe ser 'documentacion' o 'imagen'" }, { status: 400 });
  }

  const endpoint = `${API_URL}/diagnostico/${id}/${tipo}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "x-api-secret": API_SECRET },
    signal: AbortSignal.timeout(90_000),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
