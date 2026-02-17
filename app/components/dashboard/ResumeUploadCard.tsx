'use client';

import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';

export default function ResumeUploadCard() {
    const { user } = useAuth();
    const [fileName, setFileName] = useState<string | null>(null);

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            return;
        }
        setFileName(selectedFile.name);
    }

    let statusLabel = 'Não enviado';
    if (user.resumeSyncStatus === 'ready') {
        statusLabel = 'Sincronizado';
    } else if (user.resumeSyncStatus === 'processing') {
        statusLabel = 'Processando';
    } else if (user.resumeSyncStatus === 'uploaded') {
        statusLabel = 'Enviado';
    }

    return (
        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Currículo e Skills
                </h2>
                <span className="material-symbols-outlined text-primary text-xl">upload_file</span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
                Envie seu currículo para alimentar automaticamente as skills do perfil.
            </p>

            <div className="mt-4">
                <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold rounded border border-primary/30 text-primary bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors uppercase">
                    <span>Upload PDF</span>
                    <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </label>
            </div>

            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p>Status da sincronização: <span className="font-bold">{statusLabel}</span></p>
                {fileName && <p>Arquivo selecionado: <span className="font-bold">{fileName}</span></p>}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {user.knownTechnologies.map((technology) => (
                    <span
                        key={technology}
                        className="inline-flex items-center px-2 py-1 text-xs font-mono font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded"
                    >
                        {technology}
                    </span>
                ))}
            </div>
        </div>
    );
}
