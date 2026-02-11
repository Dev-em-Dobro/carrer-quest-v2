'use client';

import { WeeklyMetric } from '@/app/types';

interface WeeklyOutputCardProps {
    readonly metrics: WeeklyMetric[];
    readonly profileViews?: number;
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

const CHART_DATA = [2, 4, 3, 5, 8, 4, 3];
const HIGHLIGHT_INDEX = 4;

export default function WeeklyOutputCard({ metrics, profileViews = 45 }: Readonly<WeeklyOutputCardProps>) {
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
                        <div className="w-full bg-slate-200/30 dark:bg-black/20 h-3 rounded-full overflow-hidden border border-black/10">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${metric.label === 'Applications Sent' ? 'bg-white' : 'bg-accent'}`}
                                style={{ width: `${((metric.current / metric.goal) * 100).toFixed(0)}%` }}
                            />
                        </div>
                    </div>
                ))}

                {/* Profile Views Chart */}
                <div>
                    <div className="flex justify-between text-xs mb-2 font-mono font-bold">
                        <span className="opacity-80">Profile Views</span>
                        <span>{profileViews}</span>
                    </div>
                    <div className="flex items-end h-10 space-x-1 mt-2">
                        {CHART_DATA.map((height, index) => (
                            <div
                                key={`chart-day-${index + 1}`}
                                className={`w-full rounded-t-sm transition-all ${getChartBarClass(index, HIGHLIGHT_INDEX)}`}
                                style={{ height: `${height * 0.25}rem` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
