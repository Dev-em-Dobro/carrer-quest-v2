import { JobSource } from "@prisma/client";

import { prisma } from "@/app/lib/prisma";
import { buildJobFingerprint } from "@/app/lib/jobs/dedupe";
import { normalizeLevel, normalizeLocation, normalizeStack } from "@/app/lib/jobs/normalizers";
import { fetchFromAdzuna } from "@/app/lib/jobs/sources/adzuna";
import { fetchFromGupy } from "@/app/lib/jobs/sources/gupy";
import { fetchFromProgramathor } from "@/app/lib/jobs/sources/programathor";
import { fetchFromRemotive } from "@/app/lib/jobs/sources/remotive";
import { fetchFromRemoteOk } from "@/app/lib/jobs/sources/remoteok";
import { fetchFromTrampos } from "@/app/lib/jobs/sources/trampos";
import type { RawSourceJob } from "@/app/lib/jobs/types";

function normalizeSourceUrl(value: string): string | null {
    try {
        const parsed = new URL(value);
        return parsed.toString();
    } catch {
        return null;
    }
}

type PersistResult = "inserted" | "updated" | "skipped";

async function persistRawJob(rawJob: RawSourceJob): Promise<PersistResult> {
    const sourceUrl = normalizeSourceUrl(rawJob.sourceUrl);

    if (!sourceUrl) {
        return "skipped";
    }

    const source = rawJob.source ?? JobSource.GUPY;
    const externalId = rawJob.externalId ?? null;
    const publishedAt = rawJob.publishedAt ? new Date(rawJob.publishedAt) : null;
    const { location, isRemote } = normalizeLocation(rawJob.location);
    const normalizedStack = normalizeStack(rawJob.stack);
    const fingerprint = buildJobFingerprint({
        title: rawJob.title,
        companyName: rawJob.companyName,
        sourceUrl,
    });

    if (externalId) {
        const existingBySourceExternalId = await prisma.job.findUnique({
            where: {
                source_externalId: {
                    source,
                    externalId,
                },
            },
            select: {
                id: true,
            },
        });

        if (existingBySourceExternalId) {
            await prisma.job.update({
                where: {
                    id: existingBySourceExternalId.id,
                },
                data: {
                    title: rawJob.title,
                    companyName: rawJob.companyName,
                    level: normalizeLevel(rawJob.level),
                    stack: normalizedStack,
                    location,
                    isRemote,
                    publishedAt,
                    source,
                    sourceUrl,
                    externalId,
                    lastSeenAt: new Date(),
                },
            });

            return "updated";
        }
    }

    const existing = await prisma.job.findUnique({
        where: { fingerprint },
        select: { id: true },
    });

    await prisma.job.upsert({
        where: { fingerprint },
        create: {
            title: rawJob.title,
            companyName: rawJob.companyName,
            level: normalizeLevel(rawJob.level),
            stack: normalizedStack,
            location,
            isRemote,
            publishedAt,
            source,
            sourceUrl,
            externalId,
            fingerprint,
            lastSeenAt: new Date(),
        },
        update: {
            title: rawJob.title,
            companyName: rawJob.companyName,
            level: normalizeLevel(rawJob.level),
            stack: normalizedStack,
            location,
            isRemote,
            publishedAt,
            source,
            sourceUrl,
            externalId,
            lastSeenAt: new Date(),
        },
    });

    return existing ? "updated" : "inserted";
}

export async function bootstrapInitialJobs() {
    const shouldUseGupy = process.env.JOBS_CONNECTOR_GUPY !== "false";
    const shouldUseRemotive = process.env.JOBS_CONNECTOR_REMOTIVE === "true";
    const shouldUseRemoteOk = process.env.JOBS_CONNECTOR_REMOTEOK === "true";
    const shouldUseProgramathor = process.env.JOBS_CONNECTOR_PROGRAMATHOR === "true";
    const shouldUseTrampos = process.env.JOBS_CONNECTOR_TRAMPOS === "true";
    const shouldUseAdzuna = process.env.JOBS_CONNECTOR_ADZUNA === "true";

    const [gupyJobs, remotiveJobs, remoteOkJobs, programathorJobs, tramposJobs, adzunaJobs] = await Promise.all([
        shouldUseGupy ? fetchFromGupy() : Promise.resolve([]),
        shouldUseRemotive ? fetchFromRemotive() : Promise.resolve([]),
        shouldUseRemoteOk ? fetchFromRemoteOk() : Promise.resolve([]),
        shouldUseProgramathor ? fetchFromProgramathor() : Promise.resolve([]),
        shouldUseTrampos ? fetchFromTrampos() : Promise.resolve([]),
        shouldUseAdzuna ? fetchFromAdzuna() : Promise.resolve([]),
    ]);

    const rawJobs = [...gupyJobs, ...remotiveJobs, ...remoteOkJobs, ...programathorJobs, ...tramposJobs, ...adzunaJobs];

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const rawJob of rawJobs) {
        const result = await persistRawJob(rawJob);

        if (result === "inserted") {
            insertedCount += 1;
        } else if (result === "updated") {
            updatedCount += 1;
        } else {
            skippedCount += 1;
        }
    }

    return {
        fetchedCount: rawJobs.length,
        insertedCount,
        updatedCount,
        skippedCount,
    };
}
