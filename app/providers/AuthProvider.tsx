"use client";

import { createContext, useContext, useMemo } from "react";

import { useSession } from "@/app/lib/auth-client";
import { mockUserProfile } from "@/app/lib/mockData";
import type { UserProfile } from "@/app/types";

type AuthContextValue = {
    user: UserProfile;
    isAuthenticated: boolean;
    isPending: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const { data: session, isPending } = useSession();

    const value = useMemo<AuthContextValue>(() => {
        if (!session?.user) {
            return {
                user: mockUserProfile,
                isAuthenticated: false,
                isPending,
            };
        }

        return {
            user: {
                ...mockUserProfile,
                name: session.user.name || session.user.email,
                avatar: session.user.image || "/default-avatar.png",
                role: session.user.email,
            },
            isAuthenticated: true,
            isPending,
        };
    }, [isPending, session?.user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth deve ser usado dentro de AuthProvider.");
    }

    return context;
}
