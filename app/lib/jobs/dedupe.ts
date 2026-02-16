import { createHash } from "node:crypto";

export function buildJobFingerprint(input: {
    title: string;
    companyName: string;
    sourceUrl: string;
}) {
    const payload = `${input.title}|${input.companyName}|${input.sourceUrl}`.toLowerCase().trim();
    return createHash("sha256").update(payload).digest("hex");
}
