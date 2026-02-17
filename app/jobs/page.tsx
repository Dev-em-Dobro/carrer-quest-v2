import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import SearchFilterBar from '../components/dashboard/SearchFilterBar';
import CuratedJobCard from '../components/dashboard/CuratedJobCard';
import { getJobBoardJobs } from '../lib/jobs/jobBoard';

export default async function JobsPage() {
    const jobs = await getJobBoardJobs();

    return (
        <div className="min-h-screen flex dark bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans antialiased">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-visible lg:overflow-hidden bg-background-light dark:bg-background-dark">
                <Header title="Job Board" />

                <div className="flex-1 overflow-visible lg:overflow-auto p-6 md:p-8">
                    <div className="space-y-6">
                        <SearchFilterBar />

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
                </div>
            </main>
        </div>
    );
}
