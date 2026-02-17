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

function detectWorkModel(location: string | null, isRemote: boolean) {
    const text = normalize(location ?? '');

    if (isRemote || /remoto|remote|home\s?office/.test(text)) {
        return 'Remoto';
    }

    if (/h[ií]brido|hybrid/.test(text)) {
        return 'Híbrido';
    }

    return 'Presencial';
}

function SectionCard({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
    return (
        <section className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 shadow-sm rounded-xl">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">{title}</h2>
            {children}
        </section>
    );
}

export default async function AnalyticsPage() {
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

    const fitScores = jobs.map((job) => {
        const requiredSkills = [...new Set(job.stack.map(normalize))];
        if (requiredSkills.length === 0) {
            return 100;
        }

        const matched = requiredSkills.filter((skill) => knownSet.has(skill)).length;
        return Math.round((matched / requiredSkills.length) * 100);
    });

    const avgFit = fitScores.length > 0
        ? Math.round(fitScores.reduce((acc, value) => acc + value, 0) / fitScores.length)
        : 0;
    const highFitJobs = fitScores.filter((value) => value >= 70).length;
    const mediumFitJobs = fitScores.filter((value) => value >= 50 && value < 70).length;
    const lowFitJobs = fitScores.filter((value) => value < 50).length;

    const workModelCounts = { Remoto: 0, Híbrido: 0, Presencial: 0 };
    const levelCounts = { ESTAGIO: 0, JUNIOR: 0, PLENO: 0, SENIOR: 0, OUTRO: 0 };

    for (const job of jobs) {
        const workModel = detectWorkModel(job.location, job.isRemote);
        workModelCounts[workModel] += 1;
        levelCounts[job.level] += 1;
    }

    return (
        <div className="min-h-screen flex dark bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans antialiased">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-visible lg:overflow-hidden bg-background-light dark:bg-background-dark">
                <Header title="Analytics" />

                <div className="flex-1 overflow-visible lg:overflow-auto p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <SectionCard title="Vagas Analisadas">
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{jobs.length}</p>
                        </SectionCard>

                        <SectionCard title="Fit Médio">
                            <p className="text-3xl font-bold text-primary">{avgFit}%</p>
                        </SectionCard>

                        <SectionCard title="Alta Compat.">
                            <p className="text-3xl font-bold text-emerald-600">{highFitJobs}</p>
                        </SectionCard>

                        <SectionCard title="Baixa Compat.">
                            <p className="text-3xl font-bold text-amber-600">{lowFitJobs}</p>
                        </SectionCard>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SectionCard title="Distribuição por Fit">
                            <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                                <p><span className="font-bold">Alta (≥70%):</span> {highFitJobs}</p>
                                <p><span className="font-bold">Média (50-69%):</span> {mediumFitJobs}</p>
                                <p><span className="font-bold">Baixa (&lt;50%):</span> {lowFitJobs}</p>
                            </div>
                        </SectionCard>

                        <SectionCard title="Modelo de Trabalho">
                            <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                                <p><span className="font-bold">Remoto:</span> {workModelCounts.Remoto}</p>
                                <p><span className="font-bold">Híbrido:</span> {workModelCounts.Híbrido}</p>
                                <p><span className="font-bold">Presencial:</span> {workModelCounts.Presencial}</p>
                            </div>
                        </SectionCard>
                    </div>

                    <SectionCard title="Distribuição por Senioridade">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm text-slate-700 dark:text-slate-200">
                            <p><span className="font-bold">Estágio:</span> {levelCounts.ESTAGIO}</p>
                            <p><span className="font-bold">Júnior:</span> {levelCounts.JUNIOR}</p>
                            <p><span className="font-bold">Pleno:</span> {levelCounts.PLENO}</p>
                            <p><span className="font-bold">Sênior:</span> {levelCounts.SENIOR}</p>
                            <p><span className="font-bold">Outro:</span> {levelCounts.OUTRO}</p>
                        </div>
                    </SectionCard>
                </div>
            </main>
        </div>
    );
}
