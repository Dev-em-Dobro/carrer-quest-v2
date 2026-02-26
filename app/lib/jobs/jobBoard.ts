import { JobLevel, JobSource } from '@prisma/client';

import { prisma } from '@/app/lib/prisma';

const JOB_BOARD_STACK_FILTER = [
    'frontend',
    'backend',
    'fullstack',
    'javascript',
    'typescript',
    'python',
    'react',
    'next',
    'node',
    'express',
    'nestjs',
];

export async function getJobBoardJobs() {
    return prisma.job.findMany({
        where: {
            source: {
                in: [JobSource.GUPY, JobSource.OTHER],
            },
            level: { in: [JobLevel.ESTAGIO, JobLevel.JUNIOR, JobLevel.PLENO, JobLevel.OUTRO] },
            OR: [
                {
                    stack: {
                        hasSome: JOB_BOARD_STACK_FILTER,
                    },
                },
                {
                    stack: {
                        isEmpty: true,
                    },
                },
            ],
        },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        select: {
            id: true,
            title: true,
            companyName: true,
            level: true,
            stack: true,
            location: true,
            isRemote: true,
            publishedAt: true,
            source: true,
            sourceUrl: true,
            createdAt: true,
        },
    });
}
