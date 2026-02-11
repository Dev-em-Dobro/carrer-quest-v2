'use client';

import { PeerUser } from '@/app/types';

interface TopPeersCardProps {
    readonly peers: PeerUser[];
}

function getPeerRankClass(peer: PeerUser): string {
    if (peer.isCurrentUser) {
        return 'text-amber-600 dark:text-secondary';
    }
    if (peer.rank === 1) {
        return 'text-slate-400 dark:text-secondary';
    }
    return 'text-slate-400 dark:text-slate-500';
}

function getPeerXpClass(peer: PeerUser): string {
    if (peer.isCurrentUser) {
        return 'text-amber-700 dark:text-secondary/80';
    }
    if (peer.rank === 1) {
        return 'text-primary';
    }
    return 'text-slate-500 dark:text-slate-400';
}

export default function TopPeersCard({ peers }: Readonly<TopPeersCardProps>) {
    return (
        <div className="bg-white dark:bg-background-dark border border-border-light dark:border-border-dark p-5 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Top Peers
                </h2>
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-lg">
                    leaderboard
                </span>
            </div>

            <ul className="space-y-3">
                {peers.map((peer) => (
                    <li
                        key={peer.id}
                        className={`flex items-center justify-between p-2 rounded-lg transition-colors ${peer.isCurrentUser
                                ? 'bg-amber-50 dark:bg-secondary/10 border border-secondary/20 dark:border-secondary/30 shadow-inner'
                                : 'hover:bg-slate-50 dark:hover:bg-surface-dark'
                            }`}
                    >
                        <div className="flex items-center">
                            <span
                                className={`text-xs font-mono font-bold w-4 ${getPeerRankClass(peer)}`}
                            >
                                {peer.rank.toString().padStart(2, '0')}
                            </span>
                            <div
                                className={`h-8 w-8 rounded-full ml-2 border ${peer.isCurrentUser
                                        ? 'bg-amber-200 dark:bg-secondary/20 border-amber-300 dark:border-secondary/40'
                                        : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                                    }`}
                            >
                                {peer.avatar && (
                                    <img
                                        src={peer.avatar}
                                        alt={peer.username}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                )}
                            </div>
                            <span
                                className={`text-sm ml-3 ${peer.isCurrentUser
                                        ? 'font-bold text-amber-900 dark:text-secondary'
                                        : 'font-medium text-slate-700 dark:text-white'
                                    }`}
                            >
                                {peer.username}
                            </span>
                        </div>
                        <span
                            className={`text-xs font-mono font-bold ${getPeerXpClass(peer)}`}
                        >
                            {peer.xp} XP
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
