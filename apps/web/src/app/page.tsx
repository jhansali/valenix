import { ArrowRight, Check, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

const features = [
  "Low-friction AI chat",
  "Google or email signup",
  "Free tier at launch",
  "$5/month Pro plan"
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f7f2] text-ink">
      <section className="relative min-h-[92vh] overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[#f5f7f2]" />
        <div className="absolute right-0 top-0 h-48 w-1/3 bg-[#e0ff8f]" />
        <div className="absolute bottom-0 left-0 h-40 w-1/4 bg-[#dbe7e3]" />
        <div className="absolute inset-x-4 bottom-4 top-20 rounded-lg border border-[#d8ddd2] bg-white/60 shadow-2xl backdrop-blur-sm sm:inset-x-6 lg:inset-x-8" />
        <div className="absolute bottom-8 right-6 hidden w-[54rem] max-w-[58vw] rounded-lg border border-[#cbd3c3] bg-[#111827] p-4 shadow-2xl lg:block">
          <div className="grid min-h-[31rem] grid-cols-[15rem_1fr] overflow-hidden rounded-md bg-white">
            <aside className="border-r border-line bg-panel p-3">
              <div className="mb-4 flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold">
                <Sparkles size={16} />
                Valenix
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
            <div className="flex flex-col bg-white">
              <div className="border-b border-line px-5 py-4 text-sm font-semibold">Chat preview</div>
              <div className="flex-1 space-y-4 p-6">
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

        <div className="relative z-10 mx-auto flex min-h-[calc(92vh-2.5rem)] max-w-7xl flex-col">
          <header className="flex items-center justify-between">
            <Link className="text-lg font-semibold tracking-tight" href="/">
              Valenix
            </Link>
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

          <div className="grid flex-1 items-center py-16">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ccd5c5] bg-white px-3 py-1 text-sm font-medium text-gray-700">
                <Zap size={15} />
                Early access opening soon
              </div>
              <h1 className="mt-7 text-5xl font-semibold leading-[1.02] tracking-normal text-ink sm:text-6xl lg:text-7xl">
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
                  className="flex h-12 items-center justify-center rounded-md border border-[#cbd3c3] bg-white px-5 text-sm font-semibold text-ink hover:bg-gray-50"
                  href="/login"
                >
                  I already joined
                </Link>
              </div>
              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700" key={feature}>
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[#e0ff8f] text-ink">
                      <Check size={13} />
                    </span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
