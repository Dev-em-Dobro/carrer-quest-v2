import { ResumeSyncStatus, type UserProfile as PrismaUserProfile } from '@prisma/client';

import { prisma } from '@/app/lib/prisma';

export type ClientProfile = {
    fullName: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    city: string | null;
    professionalSummary: string | null;
    experiences: string[];
    knownTechnologies: string[];
    certifications: string[];
    languages: string[];
    resumeSyncStatus: 'not_uploaded' | 'uploaded' | 'processing' | 'ready';
    resumeFileName: string | null;
    resumeUploadedAt: string | null;
};

type SessionUser = {
    id: string;
    name?: string | null;
    email: string;
};

function mapResumeStatus(status: ResumeSyncStatus): ClientProfile['resumeSyncStatus'] {
    if (status === 'READY') {
        return 'ready';
    }
    if (status === 'PROCESSING') {
        return 'processing';
    }
    if (status === 'UPLOADED') {
        return 'uploaded';
    }
    return 'not_uploaded';
}

export function toClientProfile(profile: PrismaUserProfile): ClientProfile {
    return {
        fullName: profile.fullName,
        linkedinUrl: profile.linkedinUrl,
        githubUrl: profile.githubUrl,
        city: profile.city,
        professionalSummary: profile.professionalSummary,
        experiences: profile.experiences,
        knownTechnologies: profile.knownTechnologies,
        certifications: profile.certifications,
        languages: profile.languages,
        resumeSyncStatus: mapResumeStatus(profile.resumeSyncStatus),
        resumeFileName: profile.resumeFileName,
        resumeUploadedAt: profile.resumeUploadedAt?.toISOString() ?? null,
    };
}

export async function getOrCreateUserProfile(user: SessionUser) {
    return prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            fullName: user.name ?? user.email,
            experiences: [],
            knownTechnologies: [],
            certifications: [],
            languages: [],
            resumeSyncStatus: 'NOT_UPLOADED',
        },
    });
}
