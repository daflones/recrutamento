import { NextResponse, type NextRequest } from "next/server";
import QRCode from "qrcode";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ruisoxcbuiuktffsqcro.supabase.co";
const EDGE_URL = `${SUPABASE_URL}/functions/v1/fsociety-recruitment`;

async function ensureQrDataUrl(qrCode: string | null, qrCodeImage: string | null): Promise<string | null> {
  if (qrCodeImage && qrCodeImage.startsWith("data:image/")) {
    return qrCodeImage;
  }
  if (qrCodeImage && qrCodeImage.length > 100 && !qrCodeImage.startsWith("http")) {
    return `data:image/png;base64,${qrCodeImage}`;
  }
  if (qrCodeImage && qrCodeImage.startsWith("http")) {
    return qrCodeImage;
  }
  if (qrCode && qrCode.length > 10) {
    try {
      return await QRCode.toDataURL(qrCode, {
        width: 280,
        margin: 2,
        color: {
          dark: "#050508",
          light: "#ffffff",
        },
      });
    } catch {
      return null;
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.toString();
    const res = await fetch(`${EDGE_URL}${search ? `?${search}` : ""}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Erro ao consultar servidor." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const origin = req.headers.get("origin") || req.nextUrl.origin;

    const res = await fetch(EDGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        returnOrigin: body.returnOrigin || origin,
      }),
      cache: "no-store",
    });

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok || data.ok === false) {
      return NextResponse.json(
        { ok: false, error: data.error || data.erro || "Falha ao processar solicitação." },
        { status: res.status >= 400 ? res.status : 500 },
      );
    }

    if (data.method === "pix") {
      const qrCode = typeof data.qrCode === "string" ? data.qrCode : null;
      const qrCodeImage = typeof data.qrCodeImage === "string" ? data.qrCodeImage : null;
      data.qrCodeImage = await ensureQrDataUrl(qrCode, qrCodeImage);
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Falha de comunicação com o servidor." },
      { status: 500 },
    );
  }
}
