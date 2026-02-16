import type { JobLevel } from "@prisma/client";

const levelMap: Array<{ regex: RegExp; level: JobLevel }> = [
    { regex: /estag|intern/i, level: "ESTAGIO" },
    { regex: /junior|júnior|jr\b/i, level: "JUNIOR" },
    { regex: /pleno|mid|middle/i, level: "PLENO" },
    { regex: /senior|sênior|sr\b/i, level: "SENIOR" },
];

export function normalizeLevel(input?: string | null): JobLevel {
    if (!input) {
        return "OUTRO";
    }

    const match = levelMap.find((item) => item.regex.test(input));
    return match?.level ?? "OUTRO";
}

export function normalizeStack(input: string[] | string | null | undefined): string[] {
    let values: string[] = [];

    if (Array.isArray(input)) {
        values = input;
    } else if (input) {
        values = input.split(",");
    }

    return [...new Set(values.map((item) => item.trim().toLowerCase()).filter(Boolean))];
}

export function normalizeLocation(input?: string | null) {
    if (!input) {
        return { location: null, isRemote: false };
    }

    const value = input.trim();
    const isRemote = /remote|remoto|home\s?office|anywhere/i.test(value);

    return {
        location: value,
        isRemote,
    };
}
