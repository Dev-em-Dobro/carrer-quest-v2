'use client';

import { useAuth } from '@/app/providers/AuthProvider';
import type { JobListItem } from '@/app/lib/jobs/types';

interface CandidacyReadinessCardProps {
    readonly jobs: JobListItem[];
}

type JobFit = {
    readonly id: string;
    readonly title: string;
    readonly fitPercentage: number;
    readonly missingSkills: string[];
};

export default function CandidacyReadinessCard({ jobs }: Readonly<CandidacyReadinessCardProps>) {
    const { user } = useAuth();
    const normalize = (value: string) => value.toLowerCase().trim();
    const normalizedKnownTech = new Set(user.knownTechnologies.map(normalize));

    const jobFitAnalysis: JobFit[] = jobs.map((job) => {
        const requiredSkills = [...new Set(job.stack.map(normalize))];
        const matchedSkills = requiredSkills.filter((skill) => normalizedKnownTech.has(skill));
        const fitPercentage = requiredSkills.length === 0
            ? 100
            : Math.round((matchedSkills.length / requiredSkills.length) * 100);

        return {
            id: job.id,
            title: job.title,
            fitPercentage,
            missingSkills: requiredSkills.filter((skill) => !normalizedKnownTech.has(skill)),
        };
    });

    const compatibleJobs = jobFitAnalysis.filter((job) => job.fitPercentage >= 50);
    const insufficientJobs = jobFitAnalysis.filter((job) => job.fitPercentage < 50);

    const missingSkillFrequency = new Map<string, number>();
    for (const job of insufficientJobs) {
        for (const skill of job.missingSkills) {
            missingSkillFrequency.set(skill, (missingSkillFrequency.get(skill) ?? 0) + 1);
        }
    }

    const prioritizedMissingSkills = [...missingSkillFrequency.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 6)
        .map(([skill]) => skill);

    let statusText = 'Aguardando vagas disponíveis para cálculo de aptidão';

    if (jobs.length > 0 && insufficientJobs.length === 0) {
        statusText = 'Apto para candidatura nas vagas atuais';
    } else if (jobs.length > 0) {
        statusText = `Você está apto para ${compatibleJobs.length} de ${jobs.length} vagas atuais`;
    }

    const showGapRecommendation = insufficientJobs.length > 0;

    return (
        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Status de Aptidão
                </h2>
                <span className="material-symbols-outlined text-secondary text-xl">track_changes</span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
                {statusText}
            </p>

            {jobs.length > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Compatibilidade média: {Math.round(jobFitAnalysis.reduce((sum, job) => sum + job.fitPercentage, 0) / jobFitAnalysis.length)}%
                </p>
            )}

            {showGapRecommendation && (
                <div className="mt-4 p-3 rounded-lg border border-amber-200 dark:border-secondary/30 bg-amber-50 dark:bg-background-dark">
                    <p className="text-xs font-bold text-amber-700 dark:text-secondary uppercase mb-2">
                        Recomendação
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                        O nível de complexidade de parte das vagas pode estar acima do estágio atual. Priorize as skills mais recorrentes abaixo antes de se candidatar.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {prioritizedMissingSkills.map((skill) => (
                            <span
                                key={skill}
                                className="inline-flex items-center px-2 py-1 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
