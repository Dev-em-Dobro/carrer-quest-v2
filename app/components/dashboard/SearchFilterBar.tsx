'use client';

interface SearchFilterBarProps {
    readonly onSearchChange?: (value: string) => void;
    readonly onSortChange?: (value: string) => void;
    readonly onLevelChange?: (value: string) => void;
}

export default function SearchFilterBar({ onSearchChange, onSortChange, onLevelChange }: Readonly<SearchFilterBarProps>) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-surface-dark p-4 border border-border-light dark:border-border-dark shadow-sm rounded-lg">
            {/* Search Input */}
            <div className="relative grow">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-lg">
                        search
                    </span>
                </span>
                <input
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-border-dark rounded dark:bg-background-dark dark:text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm font-mono"
                    placeholder="Filtrar por título, empresa ou tecnologia..."
                    type="text"
                    onChange={(e) => onSearchChange?.(e.target.value)}
                />
            </div>

            {/* Level Filter */}
            <div className="flex gap-2">
                <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-border-dark bg-transparent dark:bg-background-dark dark:text-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded font-mono border"
                    onChange={(e) => onLevelChange?.(e.target.value)}
                    defaultValue="all"
                >
                    <option value="all">Todas senioridades</option>
                    <option value="ESTAGIO">Estágio</option>
                    <option value="JUNIOR">Júnior</option>
                    <option value="PLENO">Pleno</option>
                    <option value="SENIOR">Sênior</option>
                </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex gap-2">
                <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-border-dark bg-transparent dark:bg-background-dark dark:text-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded font-mono border"
                    onChange={(e) => onSortChange?.(e.target.value)}
                >
                    <option value="relevant">Mais compatíveis</option>
                    <option value="newest">Mais recentes</option>
                    <option value="salary">Empresa (A-Z)</option>
                </select>
            </div>
        </div>
    );
}
