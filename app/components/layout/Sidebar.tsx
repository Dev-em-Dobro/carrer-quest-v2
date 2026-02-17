'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, LOGO_TEXT } from '@/app/lib/constants';
import { useAuth } from '@/app/providers/AuthProvider';

export default function Sidebar() {
    const { user } = useAuth();
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white dark:bg-background-dark border-r border-border-light dark:border-border-dark shrink-0 hidden lg:flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-border-light dark:border-border-dark">
                <span className="material-symbols-outlined text-primary mr-2">terminal</span>
                <span className="font-mono font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                    {LOGO_TEXT.main}
                    <span className="text-primary">{LOGO_TEXT.accent}</span>
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = item.href === '/'
                        ? pathname === '/'
                        : pathname.startsWith(item.href);

                    return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded transition-colors ${isActive
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-slate-600 dark:text-text-muted-dark hover:bg-slate-50 dark:hover:bg-surface-dark hover:text-slate-900 dark:hover:text-white group'
                            }`}
                    >
                        <span
                            className={`material-symbols-outlined mr-3 text-xl ${!isActive && 'group-hover:text-slate-500 dark:group-hover:text-white'
                                }`}
                        >
                            {item.icon}
                        </span>
                        {item.label}
                    </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-border-light dark:border-border-dark">
                <div className="flex items-center">
                    <img
                        alt={`${user.name} Avatar`}
                        className="h-8 w-8 rounded bg-slate-300 dark:bg-slate-700 object-cover ring-2 ring-border-dark"
                        src={user.avatar || '/default-avatar.png'}
                    />
                    <div className="ml-3">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
