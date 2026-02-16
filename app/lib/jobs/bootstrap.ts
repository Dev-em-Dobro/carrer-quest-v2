import { JobSource } from "@prisma/client";

import { prisma } from "@/app/lib/prisma";
import { buildJobFingerprint } from "@/app/lib/jobs/dedupe";
import { normalizeLevel, normalizeLocation, normalizeStack } from "@/app/lib/jobs/normalizers";
import { fetchFromGupy } from "@/app/lib/jobs/sources/gupy";

function normalizeSourceUrl(value: string): string | null {
    try {
        const parsed = new URL(value);
        return parsed.toString();
    } catch {
        return null;
    }
}

export async function bootstrapInitialJobs() {
    const rawJobs = await fetchFromGupy();

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const rawJob of rawJobs) {
        const sourceUrl = normalizeSourceUrl(rawJob.sourceUrl);

        if (!sourceUrl) {
            skippedCount += 1;
            continue;
        }

        const { location, isRemote } = normalizeLocation(rawJob.location);
        const normalizedStack = normalizeStack(rawJob.stack);
        const fingerprint = buildJobFingerprint({
            title: rawJob.title,
            companyName: rawJob.companyName,
            sourceUrl,
        });

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
                publishedAt: rawJob.publishedAt ? new Date(rawJob.publishedAt) : null,
                source: JobSource.GUPY,
                sourceUrl,
                externalId: rawJob.externalId ?? null,
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
                publishedAt: rawJob.publishedAt ? new Date(rawJob.publishedAt) : null,
                sourceUrl,
                externalId: rawJob.externalId ?? null,
                lastSeenAt: new Date(),
            },
        });

        if (existing) {
            updatedCount += 1;
        } else {
            insertedCount += 1;
        }
    }

    return {
        fetchedCount: rawJobs.length,
        insertedCount,
        updatedCount,
        skippedCount,
    };
}
