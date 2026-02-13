'use client';

import { useAuth } from '@/app/providers/AuthProvider';

interface HeaderProps {
    readonly title?: string;
}

export default function Header({ title = 'Overview' }: Readonly<HeaderProps>) {
    const { user } = useAuth();

    return (
        <header className="bg-white dark:bg-background-dark border-b border-border-light dark:border-border-dark h-16 flex items-center justify-between px-6">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>

            <div className="flex items-center space-x-6">
                {/* Actions */}
                <div className="flex items-center space-x-4">
                    <button className="p-1 text-slate-400 hover:text-slate-500 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="p-1 text-slate-400 hover:text-slate-500 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>

                <div className="hidden sm:flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
                    </div>
                    <img
                        alt={`${user.name} Avatar`}
                        className="h-8 w-8 rounded bg-slate-300 dark:bg-slate-700 object-cover ring-2 ring-border-dark"
                        src={user.avatar || '/default-avatar.png'}
                    />
                </div>
            </div>
        </header>
    );
}
