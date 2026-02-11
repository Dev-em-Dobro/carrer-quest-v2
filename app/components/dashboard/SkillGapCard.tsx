'use client';

import { Skill } from '@/app/types';

interface SkillGapCardProps {
    readonly skills: Skill[];
}

export default function SkillGapCard({ skills }: Readonly<SkillGapCardProps>) {
    return (
        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Skill Gap
                </h2>
                <span className="material-symbols-outlined text-secondary text-xl">warning</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
                Acquire these skills to unlock {skills[0]?.unlockCount || 14}+ senior roles.
            </p>

            <div className="space-y-3">
                {skills.map((skill) => (
                    <div
                        key={skill.id}
                        className="flex items-center justify-between p-2 border border-amber-200 dark:border-secondary/30 bg-amber-50 dark:bg-background-dark rounded-lg"
                    >
                        <div className="flex items-center">
                            <span className="material-symbols-outlined text-amber-600 dark:text-secondary mr-2 text-sm">
                                {skill.icon}
                            </span>
                            <span className="text-sm font-mono font-medium text-slate-700 dark:text-slate-200">
                                {skill.name}
                            </span>
                        </div>
                        <button className="text-xs font-bold text-primary dark:text-primary hover:text-primary/80 uppercase transition-colors">
                            Learn
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
