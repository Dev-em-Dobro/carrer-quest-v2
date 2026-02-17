import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import Header from '@/app/components/layout/Header';
import Sidebar from '@/app/components/layout/Sidebar';
import { auth } from '@/app/lib/auth';
import { getOrCreateUserProfile, toClientProfile } from '@/app/lib/profile/profile';

function SectionCard({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
    return (
        <section className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 shadow-sm rounded-xl">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">{title}</h2>
            {children}
        </section>
    );
}

function ListOrEmpty({ values }: Readonly<{ values: string[] }>) {
    if (values.length === 0) {
        return <p className="text-sm text-slate-500 dark:text-slate-400">Sem informações cadastradas.</p>;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {values.map((value) => (
                <span
                    key={value}
                    className="inline-flex items-center px-2 py-1 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded"
                >
                    {value}
                </span>
            ))}
        </div>
    );
}

export default async function PerfilPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        redirect('/login');
    }

    const profile = await getOrCreateUserProfile({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
    });

    const clientProfile = toClientProfile(profile);

    return (
        <div className="min-h-screen flex dark bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans antialiased">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-visible lg:overflow-hidden bg-background-light dark:bg-background-dark">
                <Header title="Perfil" />

                <div className="flex-1 overflow-visible lg:overflow-auto p-6 md:p-8 space-y-6">
                    <SectionCard title="Dados Pessoais">
                        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                            <p><span className="font-bold">Nome:</span> {clientProfile.fullName ?? 'Não informado'}</p>
                            <p><span className="font-bold">Cidade:</span> {clientProfile.city ?? 'Não informada'}</p>
                            <p><span className="font-bold">LinkedIn:</span> {clientProfile.linkedinUrl ?? 'Não informado'}</p>
                            <p><span className="font-bold">GitHub:</span> {clientProfile.githubUrl ?? 'Não informado'}</p>
                        </div>
                    </SectionCard>

                    <SectionCard title="Resumo Profissional">
                        <p className="text-sm text-slate-700 dark:text-slate-200">
                            {clientProfile.professionalSummary ?? 'Sem resumo extraído até o momento.'}
                        </p>
                    </SectionCard>

                    <SectionCard title="Experiências">
                        <ListOrEmpty values={clientProfile.experiences} />
                    </SectionCard>

                    <SectionCard title="Stacks Conhecidas">
                        <ListOrEmpty values={clientProfile.knownTechnologies} />
                    </SectionCard>

                    <SectionCard title="Certificações">
                        <ListOrEmpty values={clientProfile.certifications} />
                    </SectionCard>

                    <SectionCard title="Idiomas">
                        <ListOrEmpty values={clientProfile.languages} />
                    </SectionCard>
                </div>
            </main>
        </div>
    );
}
