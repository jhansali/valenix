"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api-client";
import { API_BASE_URL, GOOGLE_AUTH_ENABLED } from "@/lib/config";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    router.prefetch("/chat");
  }, [router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        await api.signup({ email, password, name: name || undefined });
      } else {
        await api.login({ email, password });
      }
      router.replace("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {GOOGLE_AUTH_ENABLED ? (
        <>
          <a
            className="flex h-11 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-gray-50"
            href={`${API_BASE_URL}/api/v1/auth/google/start`}
          >
            Continue with Google
          </a>
          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-gray-400">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      ) : null}
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
      {mode === "signup" ? (
        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          Name
          <input
            className="h-11 rounded-md border border-line px-3 outline-none focus:border-ink"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
          />
        </label>
      ) : null}

      <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
        Email
        <input
          className="h-11 rounded-md border border-line px-3 outline-none focus:border-ink"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          type="email"
          required
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
        Password
        <input
          className="h-11 rounded-md border border-line px-3 outline-none focus:border-ink"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          type="password"
          minLength={8}
          required
        />
      </label>

      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <button
        className="h-11 rounded-md bg-ink px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? "Continuing..." : mode === "signup" ? "Create account" : "Continue"}
      </button>
      </form>
    </div>
  );
}
