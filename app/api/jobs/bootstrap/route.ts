import { NextRequest, NextResponse } from "next/server";

import { bootstrapInitialJobs } from "@/app/lib/jobs/bootstrap";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    const secret = process.env.JOBS_BOOTSTRAP_SECRET;

    if (!secret) {
        return NextResponse.json(
            { error: "JOBS_BOOTSTRAP_SECRET não está configurado." },
            { status: 500 },
        );
    }

    const providedSecret = request.headers.get("x-bootstrap-secret");

    if (!providedSecret || providedSecret !== secret) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const result = await bootstrapInitialJobs();

    return NextResponse.json({
        message: "Bootstrap executado com sucesso.",
        ...result,
    });
}
