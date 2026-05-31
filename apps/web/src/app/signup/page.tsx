import Link from "next/link";

import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-panel px-4">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-500">Valenix</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">Create your account</h1>
        </div>
        <AuthForm mode="signup" />
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link className="font-medium text-ink underline-offset-4 hover:underline" href="/login">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}

