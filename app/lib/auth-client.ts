"use client";

import { createAuthClient } from "better-auth/react";

function resolveAuthBaseUrl() {
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (globalThis.window !== undefined) {
    return globalThis.window.location.origin;
  }

  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: resolveAuthBaseUrl(),
});

export const { signIn, signOut, signUp, useSession } = authClient;
