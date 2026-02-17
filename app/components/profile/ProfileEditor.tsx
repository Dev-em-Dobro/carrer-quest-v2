'use client';

import { useMemo, useState } from 'react';

type EditableProfile = {
    fullName: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    city: string | null;
    professionalSummary: string | null;
    experiences: string[];
    knownTechnologies: string[];
    certifications: string[];
    languages: string[];
};

interface ProfileEditorProps {
    readonly initialProfile: EditableProfile;
}

function toTextAreaValue(values: string[]) {
    return values.join('\n');
}

function fromTextAreaValue(value: string) {
    return value
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
}

export default function ProfileEditor({ initialProfile }: Readonly<ProfileEditorProps>) {
    const [fullName, setFullName] = useState(initialProfile.fullName ?? '');
    const [linkedinUrl, setLinkedinUrl] = useState(initialProfile.linkedinUrl ?? '');
    const [githubUrl, setGithubUrl] = useState(initialProfile.githubUrl ?? '');
    const [city, setCity] = useState(initialProfile.city ?? '');
    const [professionalSummary, setProfessionalSummary] = useState(initialProfile.professionalSummary ?? '');

    const [experiencesText, setExperiencesText] = useState(toTextAreaValue(initialProfile.experiences));
    const [knownTechnologiesText, setKnownTechnologiesText] = useState(toTextAreaValue(initialProfile.knownTechnologies));
    const [certificationsText, setCertificationsText] = useState(toTextAreaValue(initialProfile.certifications));
    const [languagesText, setLanguagesText] = useState(toTextAreaValue(initialProfile.languages));

    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const parsedPreview = useMemo(() => {
        return {
            experiences: fromTextAreaValue(experiencesText),
            knownTechnologies: fromTextAreaValue(knownTechnologiesText),
            certifications: fromTextAreaValue(certificationsText),
            languages: fromTextAreaValue(languagesText),
        };
    }, [certificationsText, experiencesText, knownTechnologiesText, languagesText]);

    async function handleSubmit(event: { preventDefault: () => void }) {
        event.preventDefault();
        setIsSaving(true);
        setFeedback(null);

        try {
            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName,
                    linkedinUrl,
                    githubUrl,
                    city,
                    professionalSummary,
                    experiences: parsedPreview.experiences,
                    knownTechnologies: parsedPreview.knownTechnologies,
                    certifications: parsedPreview.certifications,
                    languages: parsedPreview.languages,
                }),
            });

            const payload = (await response.json()) as { message?: string; error?: string };

            if (!response.ok) {
                setFeedback(payload.error ?? 'Não foi possível salvar o perfil.');
                return;
            }

            setFeedback(payload.message ?? 'Perfil atualizado com sucesso.');
        } catch {
            setFeedback('Falha de rede ao salvar o perfil.');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <section className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 shadow-sm rounded-xl">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Editar Perfil
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 space-y-2">
                        <span>Nome</span>
                        <input
                            className="w-full px-3 py-2 border border-slate-300 dark:border-border-dark rounded dark:bg-background-dark dark:text-white"
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                        />
                    </label>

                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 space-y-2">
                        <span>Cidade</span>
                        <input
                            className="w-full px-3 py-2 border border-slate-300 dark:border-border-dark rounded dark:bg-background-dark dark:text-white"
                            value={city}
                            onChange={(event) => setCity(event.target.value)}
                        />
                    </label>

                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 space-y-2">
                        <span>LinkedIn</span>
                        <input
                            className="w-full px-3 py-2 border border-slate-300 dark:border-border-dark rounded dark:bg-background-dark dark:text-white"
                            value={linkedinUrl}
                            onChange={(event) => setLinkedinUrl(event.target.value)}
                        />
                    </label>

                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 space-y-2">
                        <span>GitHub</span>
                        <input
                            className="w-full px-3 py-2 border border-slate-300 dark:border-border-dark rounded dark:bg-background-dark dark:text-white"
                            value={githubUrl}
                            onChange={(event) => setGithubUrl(event.target.value)}
                        />
                    </label>
                </div>

                <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 space-y-2 block">
                    <span>Resumo Profissional</span>
                    <textarea
                        className="w-full px-3 py-2 border border-slate-300 dark:border-border-dark rounded dark:bg-background-dark dark:text-white min-h-24"
                        value={professionalSummary}
                        onChange={(event) => setProfessionalSummary(event.target.value)}
                    />
                </label>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 space-y-2 block">
                        <span>Experiências (uma por linha)</span>
                        <textarea
                            className="w-full px-3 py-2 border border-slate-300 dark:border-border-dark rounded dark:bg-background-dark dark:text-white min-h-24"
                            value={experiencesText}
                            onChange={(event) => setExperiencesText(event.target.value)}
                        />
                    </label>

                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 space-y-2 block">
                        <span>Stacks Conhecidas (uma por linha)</span>
                        <textarea
                            className="w-full px-3 py-2 border border-slate-300 dark:border-border-dark rounded dark:bg-background-dark dark:text-white min-h-24"
                            value={knownTechnologiesText}
                            onChange={(event) => setKnownTechnologiesText(event.target.value)}
                        />
                    </label>

                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 space-y-2 block">
                        <span>Certificações (uma por linha)</span>
                        <textarea
                            className="w-full px-3 py-2 border border-slate-300 dark:border-border-dark rounded dark:bg-background-dark dark:text-white min-h-24"
                            value={certificationsText}
                            onChange={(event) => setCertificationsText(event.target.value)}
                        />
                    </label>

                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 space-y-2 block">
                        <span>Idiomas (uma por linha)</span>
                        <textarea
                            className="w-full px-3 py-2 border border-slate-300 dark:border-border-dark rounded dark:bg-background-dark dark:text-white min-h-24"
                            value={languagesText}
                            onChange={(event) => setLanguagesText(event.target.value)}
                        />
                    </label>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Itens atuais: {parsedPreview.knownTechnologies.length} skills, {parsedPreview.experiences.length} experiências
                    </p>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 text-xs font-bold rounded border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors uppercase disabled:opacity-60"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar Perfil'}
                    </button>
                </div>

                {feedback && (
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                        {feedback}
                    </p>
                )}
            </form>
        </section>
    );
}
