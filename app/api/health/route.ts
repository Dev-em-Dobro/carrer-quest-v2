import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";

export async function GET() {
    const rows = await sql("select 1 as ok");
    return NextResponse.json({ ok: rows[0]?.ok === 1 });
}
