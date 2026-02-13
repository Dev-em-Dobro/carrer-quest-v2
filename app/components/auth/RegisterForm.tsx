"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { authClient } from "@/app/lib/auth-client";
import { signUpSchema, type SignUpInput } from "@/app/lib/validations/auth";

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

export default function RegisterForm() {
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null);
    const [socialLoading, setSocialLoading] = useState<"google" | "linkedin" | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpInput>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = handleSubmit(async (values: SignUpInput) => {
        setAuthError(null);

        const { error } = await authClient.signUp.email({
            name: values.name,
            email: values.email,
            password: values.password,
            callbackURL: "/",
        });

        if (error) {
            setAuthError("Não foi possível criar sua conta. Verifique os dados e tente novamente.");
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
            errorCallbackURL: "/cadastro",
            newUserCallbackURL: "/",
        });

        if (error) {
            setAuthError("Falha ao iniciar cadastro social. Tente novamente.");
            setSocialLoading(null);
        }
    };

    return (
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl backdrop-blur">
            <h1 className="text-2xl font-semibold text-white">Criar conta</h1>
            <p className="mt-1 text-sm text-slate-300">Cadastre-se com e-mail/senha ou login social.</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
                <div className="space-y-1">
                    <label htmlFor="name" className="text-sm text-slate-200">
                        Nome
                    </label>
                    <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-400"
                        {...register("name")}
                    />
                    {errors.name ? <p className="text-xs text-red-300">{errors.name.message}</p> : null}
                </div>

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
                        autoComplete="new-password"
                        className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-400"
                        {...register("password")}
                    />
                    {errors.password ? <p className="text-xs text-red-300">{errors.password.message}</p> : null}
                </div>

                <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="text-sm text-slate-200">
                        Confirmar senha
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-400"
                        {...register("confirmPassword")}
                    />
                    {errors.confirmPassword ? (
                        <p className="text-xs text-red-300">{errors.confirmPassword.message}</p>
                    ) : null}
                </div>

                <AuthError message={authError} />

                <button
                    type="submit"
                    disabled={isSubmitting || Boolean(socialLoading)}
                    className="w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400 disabled:opacity-60"
                >
                    {isSubmitting ? "Criando conta..." : "Criar conta"}
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
                    {socialLoading === "google" ? "Conectando..." : "Cadastrar com Google"}
                </button>

                <button
                    type="button"
                    disabled={isSubmitting || Boolean(socialLoading)}
                    onClick={() => void handleSocial("linkedin")}
                    className="w-full rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/5 disabled:opacity-60"
                >
                    {socialLoading === "linkedin" ? "Conectando..." : "Cadastrar com LinkedIn"}
                </button>
            </div>

            <p className="mt-6 text-sm text-slate-300">
                Já tem conta?{" "}
                <Link href="/login" className="font-medium text-sky-300 hover:text-sky-200">
                    Entrar
                </Link>
            </p>
        </div>
    );
}
