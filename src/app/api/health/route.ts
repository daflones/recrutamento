export function GET() {
  return Response.json(
    { status: "ok", service: "recrutamento-fsociety" },
    { headers: { "Cache-Control": "no-store" } }
  );
}
