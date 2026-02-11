'use client';

import { UserProfile } from '@/app/types';

interface HeaderProps {
    readonly user: UserProfile;
    readonly title?: string;
}

export default function Header({ user, title = 'Overview' }: Readonly<HeaderProps>) {
    return (
        <header className="bg-white dark:bg-background-dark border-b border-border-light dark:border-border-dark h-16 flex items-center justify-between px-6">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>

            <div className="flex items-center space-x-6">
                {/* Level Progress - Hidden on mobile */}
                <div className="hidden md:flex flex-col items-end w-48">
                    <div className="flex justify-between w-full text-xs font-mono mb-1 text-slate-500 dark:text-slate-400 font-bold">
                        <span>Lvl {user.level}: {user.levelName}</span>
                        <span className="text-secondary">{user.levelProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-border-dark h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-secondary h-full rounded-full transition-all duration-300"
                            style={{ width: `${user.levelProgress}%` }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-4">
                    <button className="p-1 text-slate-400 hover:text-slate-500 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="p-1 text-slate-400 hover:text-slate-500 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
