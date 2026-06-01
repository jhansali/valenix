import Link from "next/link";

import { AuthForm } from "@/components/auth/AuthForm";
import { ValenixLogo } from "@/components/brand/ValenixLogo";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-panel px-4">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-8 shadow-sm">
        <div className="mb-8">
          <ValenixLogo href="/" size="sm" />
          <h1 className="mt-2 text-2xl font-semibold text-ink">Continue to Valenix</h1>
        </div>
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-gray-500">
          No account?{" "}
          <Link className="font-medium text-ink underline-offset-4 hover:underline" href="/signup">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
