"use client";

import { CheckCircle2, LogOut, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ValenixLogo } from "@/components/brand/ValenixLogo";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/use-auth";

const queueSteps = [
  { label: "Identity ready", progress: "100%" },
  { label: "Waitlist seat reserved", progress: "100%" },
  { label: "Chat access pending", progress: "52%" }
];

export function WaitlistPanel() {
  const router = useRouter();
  const { user, loading } = useAuth({ required: true });

  async function logout() {
    await api.logout();
    router.replace("/");
  }

  if (loading || !user) {
    return <main className="grid min-h-screen place-items-center bg-[#F8FAFC] text-sm text-gray-500">Loading...</main>;
  }

  if (user.status === "active") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F8FAFC] px-4">
        <section className="w-full max-w-md rounded-lg border border-line bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto text-sky-600" size={34} />
          <h1 className="mt-4 text-2xl font-semibold text-ink">Your access is active</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">You can open Valenix chat now.</p>
          <Link
            className="mt-6 flex h-11 items-center justify-center rounded-md bg-ink px-4 text-sm font-semibold text-white"
            href="/chat"
          >
            Open chat
          </Link>
        </section>
      </main>
    );
  }

  if (user.status !== "waitlisted") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F8FAFC] px-4">
        <section className="w-full max-w-md rounded-lg border border-line bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-ink">Account status unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            We could not confirm waitlist access for this account. Please log out and try another account.
          </p>
          <button
            className="mt-6 flex h-11 w-full items-center justify-center rounded-md bg-ink px-4 text-sm font-semibold text-white"
            onClick={logout}
          >
            Log out
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <ValenixLogo href="/" size="sm" />
          <button
            className="flex h-9 items-center gap-2 rounded-md border border-[#DBEAFE] bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={logout}
          >
            <LogOut size={15} />
            Log out
          </button>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-white px-3 py-1 text-sm font-medium text-gray-700">
              <Sparkles size={15} />
              Waitlist confirmed
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              You are on the list for early Valenix access.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600">
              We are opening access in controlled batches while we tune the model servers and keep the experience fast. Your account is ready, so you will not need to sign up again.
            </p>
            <div className="mt-8 grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
              <div className="rounded-lg border border-[#DBEAFE] bg-white p-4">
                <p className="font-semibold text-ink">Account</p>
                <p className="mt-1 truncate">{user.email}</p>
              </div>
              <div className="rounded-lg border border-[#DBEAFE] bg-white p-4">
                <p className="font-semibold text-ink">Plan preview</p>
                <p className="mt-1">Free tier + $5/month Pro</p>
              </div>
              <div className="rounded-lg border border-[#DBEAFE] bg-white p-4">
                <p className="font-semibold text-ink">Status</p>
                <p className="mt-1 capitalize">{user.status}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#C7D2FE] bg-white p-4 shadow-xl">
            <div className="rounded-md bg-ink p-5 text-white">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <p className="font-semibold">Launch queue</p>
                <span className="rounded-full bg-[#7DD3FC] px-2 py-1 text-xs font-semibold text-ink">MVP</span>
              </div>
              <ol className="mt-5 space-y-4">
                {queueSteps.map((step, index) => (
                  <li className="flex items-center gap-3" key={step.label}>
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-xs">
                      {index + 1}
                    </span>
                    <div className="h-2 flex-1 rounded-full bg-white/15" aria-hidden="true">
                      <div
                        className="h-2 rounded-full bg-[#7DD3FC]"
                        style={{ width: step.progress }}
                      />
                    </div>
                    <span className="w-32 text-xs text-white/75">{step.label}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-sm leading-6 text-white/70">
                Early users will help shape model choices, fair-use limits, and the $5/month Pro tier before the public launch.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
