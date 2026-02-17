import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import Header from '@/app/components/layout/Header';
import Sidebar from '@/app/components/layout/Sidebar';
import { auth } from '@/app/lib/auth';
import { getJobBoardJobs } from '@/app/lib/jobs/jobBoard';
import { getOrCreateUserProfile, toClientProfile } from '@/app/lib/profile/profile';

function normalize(value: string) {
    return value.toLowerCase().trim();
}

function SectionCard({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
    return (
        <section className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 shadow-sm rounded-xl">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">{title}</h2>
            {children}
        </section>
    );
}

export default async function AssessmentsPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        redirect('/login');
    }

    const [profile, jobs] = await Promise.all([
        getOrCreateUserProfile({
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
        }),
        getJobBoardJobs(),
    ]);

    const clientProfile = toClientProfile(profile);
    const knownSet = new Set(clientProfile.knownTechnologies.map(normalize));

    const demandMap = new Map<string, number>();
    for (const job of jobs) {
        const uniqueJobSkills = [...new Set(job.stack.map(normalize))];
        for (const skill of uniqueJobSkills) {
            demandMap.set(skill, (demandMap.get(skill) ?? 0) + 1);
        }
    }

    const demandedSkills = [...demandMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([skill, demand]) => ({
            skill,
            demand,
            mastered: knownSet.has(skill),
        }));

    const topDemanded = demandedSkills.slice(0, 12);
    const topGaps = demandedSkills.filter((item) => !item.mastered).slice(0, 8);
    const masteredDemanded = demandedSkills.filter((item) => item.mastered).length;
    const coverage = demandedSkills.length > 0
        ? Math.round((masteredDemanded / demandedSkills.length) * 100)
        : 0;

    return (
        <div className="min-h-screen flex dark bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans antialiased">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-visible lg:overflow-hidden bg-background-light dark:bg-background-dark">
                <Header title="Skill Assessments" />

                <div className="flex-1 overflow-visible lg:overflow-auto p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SectionCard title="Cobertura">
                            <p className="text-3xl font-bold text-primary">{coverage}%</p>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Skills demandadas já dominadas no seu perfil.</p>
                        </SectionCard>

                        <SectionCard title="Skills Demandadas">
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{demandedSkills.length}</p>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Competências identificadas nas vagas atuais.</p>
                        </SectionCard>

                        <SectionCard title="Principais Gaps">
                            <p className="text-3xl font-bold text-secondary">{topGaps.length}</p>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Skills priorizadas para evolução imediata.</p>
                        </SectionCard>
                    </div>

                    <SectionCard title="Ranking de Skills">
                        {topDemanded.length > 0 ? (
                            <div className="space-y-2">
                                {topDemanded.map((item) => (
                                    <div
                                        key={item.skill}
                                        className="flex items-center justify-between border border-slate-200 dark:border-border-dark rounded px-3 py-2 text-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-slate-700 dark:text-slate-200">{item.skill}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{item.demand} vagas</span>
                                        </div>
                                        <span className={`text-xs font-bold ${item.mastered ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {item.mastered ? 'Dominada' : 'Gap'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-600 dark:text-slate-300">Ainda não há skills suficientes para análise.</p>
                        )}
                    </SectionCard>

                    <SectionCard title="Plano de Estudo Sugerido">
                        {topGaps.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {topGaps.map((item) => (
                                    <span
                                        key={item.skill}
                                        className="inline-flex items-center px-2 py-1 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded"
                                    >
                                        {item.skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-600 dark:text-slate-300">Você está bem alinhado às skills demandadas no recorte atual.</p>
                        )}
                    </SectionCard>
                </div>
            </main>
        </div>
    );
}
