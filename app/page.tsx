import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ResumeUploadCard from './components/dashboard/ResumeUploadCard';
import CandidacyReadinessCard from './components/dashboard/CandidacyReadinessCard';
import { getJobBoardJobs } from './lib/jobs/jobBoard';

export default async function Home() {
    const jobs = await getJobBoardJobs();

    return (
        <div className="min-h-screen flex dark bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans antialiased">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-visible lg:overflow-hidden bg-background-light dark:bg-background-dark">
                {/* Header */}
                <Header title="Dashboard" />

                {/* Dashboard Content */}
                <div className="flex-1 overflow-visible lg:overflow-auto p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - User Focus */}
                        <div className="lg:col-span-2 space-y-6">
                            <ResumeUploadCard />

                            <CandidacyReadinessCard jobs={jobs} />

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

