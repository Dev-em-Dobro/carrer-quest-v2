import { NextRequest, NextResponse } from "next/server";

import { bootstrapInitialJobs } from "@/app/lib/jobs/bootstrap";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
    const bootstrapSecret = process.env.JOBS_BOOTSTRAP_SECRET;
    const cronSecret = process.env.CRON_SECRET;

    const headerSecret = request.headers.get("x-bootstrap-secret");
    const bearerToken = request.headers.get("authorization")?.replace("Bearer ", "");

    const acceptedSecrets = [bootstrapSecret, cronSecret].filter(
        (value): value is string => Boolean(value),
    );

    if (acceptedSecrets.length === 0) {
        return { ok: false, status: 500, message: "Nenhum segredo de execução está configurado." };
    }

    const provided = [headerSecret, bearerToken].filter(
        (value): value is string => Boolean(value),
    );
    const ok = provided.some((value) => acceptedSecrets.includes(value));

    if (!ok) {
        return { ok: false, status: 401, message: "Não autorizado." };
    }

    return { ok: true as const };
}

async function runBootstrap() {
    const result = await bootstrapInitialJobs();

    return NextResponse.json({
        message: "Bootstrap executado com sucesso.",
        ...result,
    });
}

async function handleBootstrap(request: NextRequest) {
    const auth = isAuthorized(request);

    if (!auth.ok) {
        return NextResponse.json({ error: auth.message }, { status: auth.status });
    }

    return runBootstrap();
}

export const GET = handleBootstrap;
export const POST = handleBootstrap;
