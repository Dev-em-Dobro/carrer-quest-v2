import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { auth } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { getOrCreateUserProfile, toClientProfile } from '@/app/lib/profile/profile';

export const runtime = 'nodejs';

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const profile = await getOrCreateUserProfile({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
    });

    return NextResponse.json({ profile: toClientProfile(profile) });
}

export async function HEAD() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return new NextResponse(null, { status: 401 });
    }

    return new NextResponse(null, { status: 200 });
}

type ProfilePatchBody = {
    fullName?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    city?: string;
    professionalSummary?: string;
    experiences?: string[];
    knownTechnologies?: string[];
    certifications?: string[];
    languages?: string[];
};

function normalizeOptionalText(value: unknown) {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function normalizeUrl(value: unknown) {
    const text = normalizeOptionalText(value);
    if (!text) {
        return null;
    }

    if (/^https?:\/\//i.test(text)) {
        return text;
    }

    return `https://${text}`;
}

function normalizeStringList(value: unknown) {
    if (!Array.isArray(value)) {
        return [];
    }

    return [...new Set(value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean))];
}

export async function PATCH(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const payload = (await request.json()) as ProfilePatchBody;

    await getOrCreateUserProfile({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
    });

    const updatedProfile = await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: {
            fullName: normalizeOptionalText(payload.fullName),
            linkedinUrl: normalizeUrl(payload.linkedinUrl),
            githubUrl: normalizeUrl(payload.githubUrl),
            city: normalizeOptionalText(payload.city),
            professionalSummary: normalizeOptionalText(payload.professionalSummary),
            experiences: normalizeStringList(payload.experiences),
            knownTechnologies: normalizeStringList(payload.knownTechnologies),
            certifications: normalizeStringList(payload.certifications),
            languages: normalizeStringList(payload.languages),
        },
    });

    return NextResponse.json({
        message: 'Perfil atualizado com sucesso.',
        profile: toClientProfile(updatedProfile),
    });
}

export async function DELETE() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    await getOrCreateUserProfile({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
    });

    const clearedProfile = await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: {
            fullName: null,
            linkedinUrl: null,
            githubUrl: null,
            city: null,
            professionalSummary: null,
            experiences: [],
            knownTechnologies: [],
            certifications: [],
            languages: [],
            resumeFileName: null,
            resumeUploadedAt: null,
            resumeSyncStatus: 'NOT_UPLOADED',
        },
    });

    return NextResponse.json({
        message: 'Dados pessoais do perfil removidos com sucesso.',
        profile: toClientProfile(clearedProfile),
    });
}

export async function POST(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({})) as { action?: string };

    if (body.action !== 'export') {
        return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
    }

    const profile = await getOrCreateUserProfile({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
    });

    return NextResponse.json({
        exportedAt: new Date().toISOString(),
        user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
        },
        profile: toClientProfile(profile),
    });
}
