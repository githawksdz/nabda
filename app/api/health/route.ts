import { NextResponse } from "next/server";

/** Liveness — no secrets, no DB. */
export async function GET() {
  return NextResponse.json(
    { status: "ok", service: "nabda-web" },
    { status: 200 },
  );
}
