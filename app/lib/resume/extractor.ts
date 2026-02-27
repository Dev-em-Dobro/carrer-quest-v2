const TECH_STACK_DICTIONARY = [
    'javascript',
    'typescript',
    'react',
    'next',
    'node',
    'express',
    'nestjs',
    'python',
    'java',
    'c#',
    '.net',
    'go',
    'rust',
    'sql',
    'postgresql',
    'mysql',
    'mongodb',
    'aws',
    'azure',
    'docker',
    'kubernetes',
    'terraform',
    'graphql',
    'tailwind',
    'html',
    'css',
    'git',
    'linux',
];

const LANGUAGE_DICTIONARY = ['português', 'portugues', 'inglês', 'ingles', 'espanhol', 'francês', 'frances', 'alemão', 'alemao'];

export type ExtractedResumeData = {
    fullName: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    city: string | null;
    professionalSummary: string | null;
    experiences: string[];
    knownTechnologies: string[];
    projects: {
        title: string;
        shortDescription: string | null;
        technologies: string[];
        deployUrl: string | null;
    }[];
    certifications: string[];
    languages: string[];
};

function normalizeLine(line: string) {
    return line.trim().split(/\s+/).join(' ');
}

function pickFullName(lines: string[]) {
    return lines
        .slice(0, 8)
        .map(normalizeLine)
        .find((line) => {
            const isNamePattern = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'\-\s]{3,60}$/.test(line);
            const isHeaderNoise = /curr[ií]culo|resume|linkedin|github|email|telefone/i.test(line);
            return isNamePattern && !isHeaderNoise;
        }) ?? null;
}

function pickSection(lines: string[], startMatchers: RegExp[], maxItems = 6) {
    const startIndex = lines.findIndex((line) => startMatchers.some((matcher) => matcher.test(line)));
    if (startIndex < 0) {
        return [];
    }

    const sectionItems: string[] = [];

    for (let index = startIndex + 1; index < lines.length; index += 1) {
        const currentLine = normalizeLine(lines[index]);

        if (!currentLine) {
            if (sectionItems.length > 0) {
                break;
            }
            continue;
        }

        if (/^(experi[eê]ncia|resumo|certifica[cç][aã]o|idioma|forma[cç][aã]o|skills|habilidades)\b/i.test(currentLine)) {
            if (sectionItems.length > 0) {
                break;
            }
            continue;
        }

        sectionItems.push(currentLine.replace(/^[-•]\s*/, ''));

        if (sectionItems.length >= maxItems) {
            break;
        }
    }

    return sectionItems;
}

function uniqueList(values: string[]) {
    return [...new Set(values.map((value) => normalizeLine(value)).filter(Boolean))];
}

function extractKnownTechnologies(text: string) {
    const normalizedText = text.toLowerCase();

    return uniqueList(
        TECH_STACK_DICTIONARY.filter((keyword) => {
            const escapedKeyword = keyword.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
            const regex = new RegExp(`(^|[^a-z0-9])${escapedKeyword}([^a-z0-9]|$)`, 'i');
            return regex.test(normalizedText);
        }),
    );
}

function normalizeTechnologyToken(token: string) {
    const cleaned = normalizeLine(token)
        .replaceAll(/[()]/g, '')
        .replaceAll(/\s+/g, ' ')
        .toLowerCase();

    const aliases: Record<string, string> = {
        'node.js': 'node',
        'node js': 'node',
        'next.js': 'next',
        'next js': 'next',
        'tailwind css': 'tailwind',
        'html5': 'html',
        'css3': 'css',
        'javascript es6': 'javascript',
        'javascript es 6': 'javascript',
    };

    const fromAlias = aliases[cleaned];
    if (fromAlias) {
        return fromAlias;
    }

    return cleaned;
}

function extractProjects(lines: string[]) {
    const projectSectionIndex = lines.findIndex((line) => /^projetos\b/i.test(line));
    if (projectSectionIndex < 0) {
        return [];
    }

    const stopSectionRegex = /^(stacks?\s+conhecidas|skills?|habilidades|forma[cç][aã]o|idiomas?|certifica[cç][aã]o|certifica[cç][oõ]es)\b/i;

    const projectLines: string[] = [];
    for (let index = projectSectionIndex + 1; index < lines.length; index += 1) {
        const currentLine = normalizeLine(lines[index]).replace(/^[-•]\s*/, '');

        if (!currentLine || /^--\s*\d+\s*of\s*\d+\s*--$/i.test(currentLine)) {
            continue;
        }

        if (stopSectionRegex.test(currentLine)) {
            break;
        }

        projectLines.push(currentLine);
    }

    const projects: {
        title: string;
        shortDescription: string | null;
        technologies: string[];
        deployUrl: string | null;
    }[] = [];

    let currentTitle: string | null = null;
    let currentDescriptionParts: string[] = [];
    let currentTechnologies: string[] = [];

    const flushProject = () => {
        if (!currentTitle) {
            return;
        }

        const shortDescription = currentDescriptionParts.length > 0 ? currentDescriptionParts.join(' ') : null;
        const normalizedTechnologies = uniqueList(currentTechnologies.map(normalizeTechnologyToken));
        const fallbackTechnologies = normalizedTechnologies.length > 0
            ? normalizedTechnologies
            : extractKnownTechnologies(`${currentTitle} ${shortDescription ?? ''}`);

        projects.push({
            title: currentTitle,
            shortDescription,
            technologies: fallbackTechnologies,
            deployUrl: null,
        });

        currentTitle = null;
        currentDescriptionParts = [];
        currentTechnologies = [];
    };

    for (const line of projectLines) {
        const techLineMatch = /^tech\s*stacks?\s*:\s*(.+)$/i.exec(line);

        if (techLineMatch) {
            currentTechnologies = techLineMatch[1]
                .split(',')
                .map((item) => normalizeTechnologyToken(item))
                .filter(Boolean);
            continue;
        }

        if (!currentTitle) {
            currentTitle = line;
            continue;
        }

        if (currentTechnologies.length > 0) {
            flushProject();
            currentTitle = line;
            continue;
        }

        currentDescriptionParts.push(line);
    }

    flushProject();

    return projects;
}

function deriveKnownTechnologiesFromProjects(projects: { technologies: string[] }[]) {
    return uniqueList(projects.flatMap((project) => project.technologies).map(normalizeTechnologyToken));
}

function extractLanguages(text: string, sectionValues: string[]) {
    const normalizedText = text.toLowerCase();
    const fromText = LANGUAGE_DICTIONARY.filter((language) => normalizedText.includes(language));

    return uniqueList([...sectionValues, ...fromText]);
}

function extractCity(lines: string[]) {
    const lineWithCityLabel = lines.find((line) => /^(cidade|localiza[cç][aã]o)\s*:/i.test(line));
    if (lineWithCityLabel) {
        return normalizeLine(lineWithCityLabel.split(':').slice(1).join(':')) || null;
    }

    const cityPatternCandidates = [
        /\b([A-Za-zÀ-ÿ\s]{2,40})\s*[-–]\s*([A-Z]{2})\b/,
        /\b([A-Za-zÀ-ÿ\s]{2,40})\s*\/\s*([A-Z]{2})\b/,
        /\b([A-Za-zÀ-ÿ\s]{2,40})\s*,\s*([A-Z]{2})\b/,
    ];

    for (const line of lines) {
        for (const pattern of cityPatternCandidates) {
            const match = pattern.exec(line);
            if (!match) {
                continue;
            }

            const city = normalizeLine(match[1] ?? '');
            const state = (match[2] ?? '').toUpperCase();

            if (city && state) {
                return `${city} - ${state}`;
            }
        }
    }

    return null;
}

function normalizeExtractedUrl(url: string) {
    const trimmed = normalizeLine(url);
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    return `https://${trimmed}`;
}

function extractLinkedinUrl(rawText: string) {
    const match = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[\w\-./?=&%]+/i.exec(rawText);
    return match?.[0] ? normalizeExtractedUrl(match[0]) : null;
}

function extractGithubUrl(rawText: string) {
    const match = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w\-./?=&%]+/i.exec(rawText);
    return match?.[0] ? normalizeExtractedUrl(match[0]) : null;
}

export function extractResumeDataFromText(rawText: string): ExtractedResumeData {
    const lines = rawText
        .split(/\r?\n/)
        .map(normalizeLine)
        .filter(Boolean);

    const summaryLines = pickSection(lines, [/^resumo\b/i, /^resumo profissional\b/i, /^sobre mim\b/i], 4);
    const experienceLines = pickSection(lines, [/^experi[eê]ncia\b/i, /^experi[eê]ncias\b/i], 8);
    const certificationLines = pickSection(lines, [/^certifica[cç][aã]o\b/i, /^certifica[cç][oõ]es\b/i], 8);
    const languageSectionLines = pickSection(lines, [/^idioma\b/i, /^idiomas\b/i, /^languages\b/i], 6);
    const projects = extractProjects(lines);

    return {
        fullName: pickFullName(lines),
        linkedinUrl: extractLinkedinUrl(rawText),
        githubUrl: extractGithubUrl(rawText),
        city: extractCity(lines),
        professionalSummary: summaryLines.length > 0 ? summaryLines.join(' ') : null,
        experiences: uniqueList(experienceLines),
        knownTechnologies: projects.length > 0
            ? deriveKnownTechnologiesFromProjects(projects)
            : [],
        projects,
        certifications: uniqueList(certificationLines),
        languages: extractLanguages(rawText, languageSectionLines),
    };
}
