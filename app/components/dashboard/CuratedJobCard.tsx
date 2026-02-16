import type { JobListItem } from "@/app/lib/jobs/types";

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
    console.log("Renderizando CuratedJobCard para vaga:", job.title);
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

            <div className="mt-4 flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>Fonte: {sourceLabel[job.source]}</span>
                <a
                    href={job.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                >
                    Ver vaga completa no site original
                </a>
            </div>
        </article>
    );
}
