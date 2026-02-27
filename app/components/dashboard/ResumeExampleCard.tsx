'use client';

export default function ResumeExampleCard() {
    return (
        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Modelo de Currículo
                </h2>
                <span className="material-symbols-outlined text-primary text-xl">description</span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
                Não tem um currículo pronto? Use nosso modelo em PDF como base para montar o seu e facilitar o upload.
            </p>

            <div className="mt-4">
                <a
                    href="/api/profile/resume/example"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold rounded border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors uppercase"
                >
                    <span>Baixar Exemplo de Currículo</span>
                    <span className="material-symbols-outlined text-base" aria-hidden="true">download</span>
                </a>
            </div>
        </div>
    );
}
