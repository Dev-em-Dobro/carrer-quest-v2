"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { authClient } from "@/app/lib/auth-client";
import { signInSchema, type SignInInput } from "@/app/lib/validations/auth";

function AuthError({ message }: Readonly<{ message: string | null }>) {
    if (!message) {
        return null;
    }

    return (
        <p role="alert" className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {message}
        </p>
    );
}

export default function LoginForm() {
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null);
    const [socialLoading, setSocialLoading] = useState<"google" | "linkedin" | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInInput>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: true,
        },
    });

    const onSubmit = handleSubmit(async (values) => {
        setAuthError(null);

        const { error } = await authClient.signIn.email({
            email: values.email,
            password: values.password,
            rememberMe: values.rememberMe,
            callbackURL: "/",
        });

        if (error) {
            setAuthError("Não foi possível fazer login. Verifique seus dados e tente novamente.");
            return;
        }

        router.push("/");
        router.refresh();
    });

    const handleSocial = async (provider: "google" | "linkedin") => {
        setAuthError(null);
        setSocialLoading(provider);

        const { error } = await authClient.signIn.social({
            provider,
            callbackURL: "/",
            errorCallbackURL: "/login",
        });

        if (error) {
            setAuthError("Falha ao iniciar login social. Tente novamente.");
            setSocialLoading(null);
        }
    };

    return (
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl backdrop-blur">
            <h1 className="text-2xl font-semibold text-white">Entrar</h1>
            <p className="mt-1 text-sm text-slate-300">Acesse sua conta com e-mail/senha ou login social.</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
                <div className="space-y-1">
                    <label htmlFor="email" className="text-sm text-slate-200">
                        E-mail
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-400"
                        {...register("email")}
                    />
                    {errors.email ? <p className="text-xs text-red-300">{errors.email.message}</p> : null}
                </div>

                <div className="space-y-1">
                    <label htmlFor="password" className="text-sm text-slate-200">
                        Senha
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-400"
                        {...register("password")}
                    />
                    {errors.password ? <p className="text-xs text-red-300">{errors.password.message}</p> : null}
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" className="h-4 w-4" {...register("rememberMe")} />
                    <span>Manter sessão ativa</span>
                </label>

                <AuthError message={authError} />

                <button
                    type="submit"
                    disabled={isSubmitting || Boolean(socialLoading)}
                    className="w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400 disabled:opacity-60"
                >
                    {isSubmitting ? "Entrando..." : "Entrar"}
                </button>
            </form>

            <div className="my-5 h-px bg-white/10" />

            <div className="space-y-3">
                <button
                    type="button"
                    disabled={isSubmitting || Boolean(socialLoading)}
                    onClick={() => void handleSocial("google")}
                    className="w-full rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/5 disabled:opacity-60"
                >
                    {socialLoading === "google" ? "Conectando..." : "Continuar com Google"}
                </button>

                <button
                    type="button"
                    disabled={isSubmitting || Boolean(socialLoading)}
                    onClick={() => void handleSocial("linkedin")}
                    className="w-full rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/5 disabled:opacity-60"
                >
                    {socialLoading === "linkedin" ? "Conectando..." : "Continuar com LinkedIn"}
                </button>
            </div>

            <p className="mt-6 text-sm text-slate-300">
                Ainda não tem conta?{" "}
                <Link href="/cadastro" className="font-medium text-sky-300 hover:text-sky-200">
                    Criar conta
                </Link>
            </p>
        </div>
    );
}
