"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useSession } from "@/app/lib/auth-client";
import { mockUserProfile } from "@/app/lib/mockData";
import type { UserProfile } from "@/app/types";

type AuthContextValue = {
    user: UserProfile;
    isAuthenticated: boolean;
    isPending: boolean;
    refreshProfile: () => Promise<void>;
};

type ApiProfileResponse = {
    profile: {
        fullName: string | null;
        linkedinUrl: string | null;
        githubUrl: string | null;
        city: string | null;
        professionalSummary: string | null;
        experiences: string[];
        knownTechnologies: string[];
        certifications: string[];
        languages: string[];
        resumeSyncStatus: UserProfile["resumeSyncStatus"];
    };
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const { data: session, isPending } = useSession();
    const [profileData, setProfileData] = useState<ApiProfileResponse["profile"] | null>(null);
    const [isProfilePending, setIsProfilePending] = useState(false);

    const refreshProfile = useCallback(async () => {
        if (!session?.user) {
            setProfileData(null);
            return;
        }

        setIsProfilePending(true);
        try {
            const response = await fetch("/api/profile", {
                method: "GET",
                cache: "no-store",
            });

            if (!response.ok) {
                return;
            }

            const payload = (await response.json()) as ApiProfileResponse;
            setProfileData(payload.profile);
        } finally {
            setIsProfilePending(false);
        }
    }, [session?.user, session?.user?.email]);

    useEffect(() => {
        void refreshProfile();
    }, [refreshProfile]);

    const value = useMemo<AuthContextValue>(() => {
        const baseUser: UserProfile = {
            ...mockUserProfile,
            name: session?.user?.name || session?.user?.email || mockUserProfile.name,
            avatar: session?.user?.image || "/default-avatar.png",
            role: session?.user?.email || mockUserProfile.role,
        };

        const mergedUser: UserProfile = profileData
            ? {
                ...baseUser,
                name: profileData.fullName ?? baseUser.name,
                linkedinUrl: profileData.linkedinUrl,
                githubUrl: profileData.githubUrl,
                city: profileData.city,
                professionalSummary: profileData.professionalSummary,
                experiences: profileData.experiences,
                knownTechnologies: profileData.knownTechnologies,
                certifications: profileData.certifications,
                languages: profileData.languages,
                resumeSyncStatus: profileData.resumeSyncStatus,
            }
            : baseUser;

        if (session?.user) {
            return {
                user: mergedUser,
                isAuthenticated: true,
                isPending: isPending || isProfilePending,
                refreshProfile,
            };
        }

        return {
            user: mockUserProfile,
            isAuthenticated: false,
            isPending,
            refreshProfile,
        };
    }, [isPending, isProfilePending, profileData, refreshProfile, session?.user, session?.user?.email, session?.user?.image, session?.user?.name]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth deve ser usado dentro de AuthProvider.");
    }

    return context;
}
