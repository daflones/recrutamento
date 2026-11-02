import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ruisoxcbuiuktffsqcro.supabase.co";
const EDGE_URL = `${SUPABASE_URL}/functions/v1/fsociety-recruitment`;
const COOKIE_NAME = "fsociety_admin_token";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });
  }

  try {
    const res = await fetch(EDGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-fsociety-admin-token": token,
      },
      body: JSON.stringify({ action: "admin_dashboard", adminToken: token }),
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return NextResponse.json(
        { ok: false, authenticated: false, error: data.error || "Sessão expirada." },
        { status: 401 },
      );
    }
    return NextResponse.json({ ...data, authenticated: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Erro ao carregar painel." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const action = String(body.action ?? "");

    if (action === "admin_logout") {
      const response = NextResponse.json({ ok: true });
      response.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
        sameSite: "lax",
      });
      return response;
    }

    if (action === "admin_login") {
      const res = await fetch(EDGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data.ok || !data.adminToken) {
        return NextResponse.json(
          { ok: false, error: data.error || "Credenciais inválidas." },
          { status: 401 },
        );
      }

      const response = NextResponse.json({ ok: true, user: data.user });
      response.cookies.set(COOKIE_NAME, String(data.adminToken), {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return response;
    }

    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Sessão expirada. Faça login novamente." },
        { status: 401 },
      );
    }

    const res = await fetch(EDGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-fsociety-admin-token": token,
      },
      body: JSON.stringify({ ...body, adminToken: token }),
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Erro interno no servidor." },
      { status: 500 },
    );
  }
}
