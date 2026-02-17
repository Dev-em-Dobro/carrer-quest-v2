'use client';

import { useMemo, useState } from 'react';

import type { JobListItem } from '@/app/lib/jobs/types';
import { useAuth } from '@/app/providers/AuthProvider';
import CuratedJobCard from '@/app/components/dashboard/CuratedJobCard';
import SearchFilterBar from '@/app/components/dashboard/SearchFilterBar';

interface JobBoardResultsProps {
    readonly jobs: JobListItem[];
}

type SortMode = 'relevant' | 'newest' | 'salary';

const levelLabel: Record<JobListItem['level'], string> = {
    ESTAGIO: 'estágio',
    JUNIOR: 'júnior',
    PLENO: 'pleno',
    SENIOR: 'sênior',
    OUTRO: 'outro',
};

function normalize(value: string) {
    return value.toLowerCase().trim();
}

function calculateJobFit(job: JobListItem, knownTechnologies: string[]) {
    const requiredSkills = job.stack.map(normalize);
    if (requiredSkills.length === 0) {
        return 100;
    }

    const known = new Set(knownTechnologies.map(normalize));
    const matched = requiredSkills.filter((skill) => known.has(skill));

    return Math.round((matched.length / requiredSkills.length) * 100);
}

export default function JobBoardResults({ jobs }: Readonly<JobBoardResultsProps>) {
    const { user } = useAuth();
    const [searchValue, setSearchValue] = useState('');
    const [sortMode, setSortMode] = useState<SortMode>('relevant');

    const filteredAndSortedJobs = useMemo(() => {
        const query = normalize(searchValue);

        const filtered = jobs.filter((job) => {
            if (!query) {
                return true;
            }

            const searchableFields = [
                normalize(job.title),
                normalize(job.companyName),
                normalize(job.location ?? ''),
                normalize(levelLabel[job.level]),
                normalize(job.isRemote ? 'remoto remote' : ''),
                ...job.stack.map(normalize),
            ];

            return searchableFields.some((field) => field.includes(query));
        });

        const sorted = [...filtered].sort((left, right) => {
            if (sortMode === 'newest') {
                const leftDate = left.publishedAt ?? left.createdAt;
                const rightDate = right.publishedAt ?? right.createdAt;
                return rightDate.getTime() - leftDate.getTime();
            }

            if (sortMode === 'salary') {
                return left.companyName.localeCompare(right.companyName);
            }

            const fitLeft = calculateJobFit(left, user.knownTechnologies);
            const fitRight = calculateJobFit(right, user.knownTechnologies);
            if (fitLeft !== fitRight) {
                return fitRight - fitLeft;
            }

            const leftDate = left.publishedAt ?? left.createdAt;
            const rightDate = right.publishedAt ?? right.createdAt;
            return rightDate.getTime() - leftDate.getTime();
        });

        return sorted;
    }, [jobs, searchValue, sortMode, user.knownTechnologies]);

    return (
        <div className="space-y-6">
            <SearchFilterBar
                onSearchChange={setSearchValue}
                onSortChange={(value) => setSortMode((value as SortMode) || 'relevant')}
            />

            {filteredAndSortedJobs.length > 0 ? (
                <div className="space-y-4 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-4 lg:[scrollbar-gutter:stable]">
                    {filteredAndSortedJobs.map((job) => <CuratedJobCard key={job.id} job={job} />)}
                </div>
            ) : (
                <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 shadow-sm rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Nenhuma vaga encontrada para os filtros selecionados.
                    </p>
                </div>
            )}
        </div>
    );
}
