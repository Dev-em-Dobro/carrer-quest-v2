'use client';

import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';

export default function ResumeUploadCard() {
    const { user, isAuthenticated, refreshProfile } = useAuth();
    const [fileName, setFileName] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (!isAuthenticated) {
            setMessage('Sua sessão expirou. Faça login novamente para enviar o currículo.');
            return;
        }

        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            return;
        }

        if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
            setMessage('Apenas arquivos PDF são aceitos.');
            return;
        }

        setIsUploading(true);
        setMessage(null);

        try {
            const body = new FormData();
            body.append('file', selectedFile);

            const response = await fetch('/api/profile/resume', {
                method: 'POST',
                body,
                credentials: 'include',
            });

            const payload = (await response.json()) as { message?: string; error?: string };

            if (response.status === 401) {
                setMessage('Sessão inválida ou expirada. Entre novamente para continuar.');
                return;
            }

            if (!response.ok) {
                setMessage(payload.error ?? 'Falha ao processar currículo.');
                return;
            }

            setFileName(selectedFile.name);
            setMessage(payload.message ?? 'Currículo enviado e processado com sucesso.');
            await refreshProfile();
        } catch {
            setMessage('Falha de rede ao enviar currículo.');
        } finally {
            setIsUploading(false);
        }
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
                    Currículo e Projetos
                </h2>
                <span className="material-symbols-outlined text-primary text-xl">upload_file</span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
                Envie seu currículo para extrair projetos e derivar automaticamente as skills do perfil.
            </p>

            <div className="mt-4">
                <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold rounded border border-primary/30 text-primary bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors uppercase">
                    <span>{isUploading ? 'Processando...' : 'Upload PDF'}</span>
                    <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        disabled={isUploading || !isAuthenticated}
                        onChange={handleFileChange}
                    />
                </label>
            </div>

            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p>Status da sincronização: <span className="font-bold">{statusLabel}</span></p>
                {!isAuthenticated && <p>Faça login para habilitar o upload de currículo.</p>}
                {fileName && <p>Arquivo selecionado: <span className="font-bold">{fileName}</span></p>}
                {message && <p>{message}</p>}
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
