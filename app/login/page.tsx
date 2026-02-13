import { headers } from "next/headers";
import { redirect } from "next/navigation";

import LoginForm from "@/app/components/auth/LoginForm";
import { auth } from "@/app/lib/auth";

export default async function LoginPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        redirect("/");
    }

    return (
        <main className="min-h-screen bg-background-dark px-4 py-10 text-white">
            <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
                <LoginForm />
            </div>
        </main>
    );
}
