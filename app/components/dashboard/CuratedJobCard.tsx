"use client";

import { useMemo, useState } from "react";
import type { JobListItem } from "@/app/lib/jobs/types";
import { useAuth } from "@/app/providers/AuthProvider";

interface CuratedJobCardProps {
    readonly job: JobListItem;
}

const levelLabel: Record<JobListItem["level"], string> = {
    ESTAGIO: "Estágio",
    JUNIOR: "Júnior",
    PLENO: "Pleno",
    SENIOR: "Sênior",
    OUTRO: "Outro",
};

const sourceLabel: Record<JobListItem["source"], string> = {
    LINKEDIN: "LinkedIn",
    GUPY: "Gupy",
    COMPANY_SITE: "Site da empresa",
    OTHER: "Outra fonte",
};

export default function CuratedJobCard({ job }: Readonly<CuratedJobCardProps>) {
    const { user } = useAuth();
    const [showSkillGapAlert, setShowSkillGapAlert] = useState(false);

    const fit = useMemo(() => {
        const normalize = (value: string) => value.toLowerCase().trim();

        const requiredSkills = job.stack.map(normalize);
        const knownSkills = new Set(user.knownTechnologies.map(normalize));

        const matchedSkills = requiredSkills.filter((skill) => knownSkills.has(skill));
        const fitPercentage = requiredSkills.length === 0
            ? 100
            : Math.round((matchedSkills.length / requiredSkills.length) * 100);

        return {
            fitPercentage,
            missingSkills: requiredSkills.filter((skill) => !knownSkills.has(skill)),
            isInsufficient: fitPercentage < 50,
        };
    }, [job.stack, user.knownTechnologies]);

    function handleApplyClick() {
        if (fit.isInsufficient) {
            setShowSkillGapAlert(true);
            return;
        }

        window.open(job.sourceUrl, "_blank", "noopener,noreferrer");
    }

    return (
        <article className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 shadow-sm rounded-xl">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{job.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {job.companyName}
                        {job.location ? ` • ${job.location}` : ""}
                        {job.isRemote ? " • Remoto" : ""}
                    </p>
                </div>

                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold border bg-primary/10 text-primary border-primary/20">
                    {levelLabel[job.level]}
                </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">Compatibilidade com seu perfil</span>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold border bg-slate-100 dark:bg-background-dark text-slate-700 dark:text-slate-200 border-slate-200 dark:border-border-dark">
                    {fit.fitPercentage}% fit
                </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {job.stack.map((tag) => (
                    <span
                        key={`${job.id}-${tag}`}
                        className="inline-flex items-center px-2 py-1 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            {showSkillGapAlert && fit.isInsufficient && (
                <div className="mt-4 p-3 rounded-lg border border-amber-200 dark:border-secondary/30 bg-amber-50 dark:bg-background-dark">
                    <p className="text-xs font-bold text-amber-700 dark:text-secondary uppercase mb-2">
                        Skills insuficientes
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                        O nível de complexidade desta vaga é superior ao seu estágio atual. Recomendamos priorizar a aquisição de novas competências técnicas.
                    </p>
                    {fit.missingSkills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {fit.missingSkills.map((skill) => (
                                <span
                                    key={`${job.id}-missing-${skill}`}
                                    className="inline-flex items-center px-2 py-1 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>Fonte: {sourceLabel[job.source]}</span>
                <div className="flex items-center gap-4">
                    <a
                        href={job.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                    >
                        Ver vaga completa
                    </a>
                    <button
                        type="button"
                        onClick={handleApplyClick}
                        className="font-bold text-primary hover:text-primary/80 uppercase transition-colors"
                    >
                        Candidatar
                    </button>
                </div>
            </div>
        </article>
    );
}
