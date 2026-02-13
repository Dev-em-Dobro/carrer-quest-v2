import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import SearchFilterBar from './components/dashboard/SearchFilterBar';
import JobCard from './components/dashboard/JobCard';
import SkillGapCard from './components/dashboard/SkillGapCard';
import WeeklyOutputCard from './components/dashboard/WeeklyOutputCard';
import {
    mockJobs,
    mockSkills,
    mockWeeklyMetrics,
} from './lib/mockData';

export default function Home() {
    return (
        <div className="min-h-screen flex dark bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans antialiased">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background-light dark:bg-background-dark">
                {/* Header */}
                <Header title="Overview" />

                {/* Dashboard Content */}
                <div className="flex-1 overflow-auto p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Jobs */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Search & Filter */}
                            <SearchFilterBar />

                            {/* Job Cards */}
                            {mockJobs.map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))}
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

