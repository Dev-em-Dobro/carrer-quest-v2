'use client';

import { WeeklyMetric } from '@/app/types';

interface WeeklyOutputCardProps {
    readonly metrics: WeeklyMetric[];
}

function getChartBarClass(index: number, highlightIndex: number): string {
    if (index === highlightIndex) {
        return 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)]';
    }
    if (index === 2) {
        return 'bg-white/50';
    }
    return 'bg-white/20';
}

export default function WeeklyOutputCard({ metrics }: Readonly<WeeklyOutputCardProps>) {
    return (
        <div className="bg-white dark:bg-primary border border-primary/20 dark:border-primary/50 p-5 shadow-lg rounded-xl text-slate-900 dark:text-white">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-5 flex items-center">
                <span className="material-symbols-outlined mr-2 text-lg">
                    trending_up
                </span>
                {' '}Weekly Output
            </h2>

            <div className="space-y-5">
                {/* Progress Bars */}
                {metrics.map((metric) => (
                    <div key={metric.label}>
                        <div className="flex justify-between text-xs mb-2 font-mono font-bold">
                            <span className="opacity-80">{metric.label}</span>
                            <span>
                                {metric.current}/{metric.goal}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
