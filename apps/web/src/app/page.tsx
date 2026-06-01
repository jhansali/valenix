import { ArrowRight, Check, Zap } from "lucide-react";
import Link from "next/link";

import { ValenixLogo } from "@/components/brand/ValenixLogo";

const features = [
  "Low-friction AI chat",
  "Google or email signup",
  "Free tier at launch",
  "$5/month Pro plan"
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-ink">
      <section className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[#F8FAFC]" />
        <div className="absolute right-0 top-0 h-40 w-1/2 bg-[#7DD3FC] sm:h-48 lg:w-1/3" />
        <div className="absolute bottom-0 left-0 h-40 w-1/3 bg-[#DBEAFE]" />
        <div className="absolute inset-x-4 bottom-4 top-20 rounded-lg border border-[#DBEAFE] bg-white/70 shadow-2xl backdrop-blur-sm sm:inset-x-6 lg:inset-x-8" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-7xl flex-col">
          <header className="flex items-center justify-between">
            <ValenixLogo href="/" size="sm" />
            <nav className="flex items-center gap-2">
              <Link className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white" href="/login">
                Log in
              </Link>
              <Link
                className="flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white"
                href="/signup"
              >
                Join waitlist
                <ArrowRight size={16} />
              </Link>
            </nav>
          </header>

          <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)] lg:py-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white px-3 py-1 text-sm font-medium text-gray-700">
                <Zap size={15} />
                Early access opening soon
              </div>
              <h1 className="mt-7 text-4xl font-semibold leading-[1.04] tracking-normal text-ink sm:text-5xl xl:text-6xl">
                Unlimited AI chat without the enterprise baggage.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-700">
                Valenix is a simple AI workspace for everyday users: quick signup, fast chat, open-source models, and a Pro plan planned at $5/month.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="flex h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-white"
                  href="/signup"
                >
                  Join the waitlist
                  <ArrowRight size={17} />
                </Link>
                <Link
                  className="flex h-12 items-center justify-center rounded-md border border-[#C7D2FE] bg-white px-5 text-sm font-semibold text-ink hover:bg-gray-50"
                  href="/login"
                >
                  I already joined
                </Link>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700" key={feature}>
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[#7DD3FC] text-ink">
                      <Check size={13} />
                    </span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <div className="rounded-lg border border-[#C7D2FE] bg-[#111827] p-3 shadow-2xl sm:p-4">
                <div className="grid overflow-hidden rounded-md bg-white md:min-h-[31rem] md:grid-cols-[13rem_1fr] xl:grid-cols-[15rem_1fr]">
                  <aside className="hidden border-r border-line bg-panel p-3 md:block">
                    <div className="mb-4 flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold">
                      <ValenixLogo size="sm" />
                    </div>
                    {["Launch plan", "Pricing notes", "Model routing", "Fair use"].map((item, index) => (
                      <div
                        className={`mb-2 rounded-md px-3 py-2 text-sm ${
                          index === 0 ? "bg-white font-medium text-ink shadow-sm" : "text-gray-500"
                        }`}
                        key={item}
                      >
                        {item}
                      </div>
                    ))}
                  </aside>
                  <div className="flex min-h-[28rem] flex-col bg-white">
                    <div className="border-b border-line px-5 py-4 text-sm font-semibold">Chat preview</div>
                    <div className="flex-1 space-y-4 p-5 sm:p-6">
                      <div className="max-w-md rounded-lg border border-line bg-white px-4 py-3 text-sm leading-6 text-gray-700 shadow-sm">
                        Build a launch checklist for a low-cost AI SaaS MVP.
                      </div>
                      <div className="ml-auto max-w-sm rounded-lg bg-ink px-4 py-3 text-sm leading-6 text-white">
                        Prioritize waitlist signup, fast onboarding, usage limits, and a clear $5/month Pro upgrade path.
                      </div>
                      <div className="max-w-lg rounded-lg border border-line bg-white px-4 py-3 text-sm leading-6 text-gray-700 shadow-sm">
                        Valenix keeps the first experience simple: create an account once, join the launch queue, then unlock chat when access opens.
                      </div>
                    </div>
                    <div className="border-t border-line p-4">
                      <div className="h-12 rounded-md border border-line bg-panel px-4 py-3 text-sm text-gray-400">
                        Message Valenix
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
