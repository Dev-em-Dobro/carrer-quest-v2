import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import SearchFilterBar from './components/dashboard/SearchFilterBar';
import CuratedJobCard from './components/dashboard/CuratedJobCard';
import SkillGapCard from './components/dashboard/SkillGapCard';
import WeeklyOutputCard from './components/dashboard/WeeklyOutputCard';
import { prisma } from './lib/prisma';
import { JobLevel, JobSource } from '@prisma/client';
import {
    mockSkills,
    mockWeeklyMetrics,
} from './lib/mockData';

export default async function Home() {
    const jobs = await prisma.job.findMany({
        where: {
            source: JobSource.GUPY,
            level: { in: [JobLevel.ESTAGIO, JobLevel.JUNIOR, JobLevel.PLENO, JobLevel.OUTRO] },
            stack: {
                hasSome: ['frontend', 'backend', 'fullstack', 'javascript', 'typescript', 'python', 'react', 'next', 'node', 'express', 'nestjs'],
            },
        },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        select: {
            id: true,
            title: true,
            companyName: true,
            level: true,
            stack: true,
            location: true,
            isRemote: true,
            publishedAt: true,
            source: true,
            sourceUrl: true,
            createdAt: true,
        },
    });

    return (
        <div className="min-h-screen flex dark bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans antialiased">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-visible lg:overflow-hidden bg-background-light dark:bg-background-dark">
                {/* Header */}
                <Header title="Overview" />

                {/* Dashboard Content */}
                <div className="flex-1 overflow-visible lg:overflow-auto p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Jobs */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Search & Filter */}
                            <SearchFilterBar />

                            {/* Job Cards */}
                            {jobs.length > 0 ? (
                                <div className="space-y-4 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-4 lg:[scrollbar-gutter:stable]">
                                    {jobs.map((job) => <CuratedJobCard key={job.id} job={job} />)}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 shadow-sm rounded-xl">
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        Nenhuma vaga curada disponível no momento.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Widgets */}
                        <div className="space-y-6">
                            {/* Skill Gap */}
                            <SkillGapCard skills={mockSkills} />

                            {/* Weekly Output */}
                            <WeeklyOutputCard metrics={mockWeeklyMetrics} />

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

