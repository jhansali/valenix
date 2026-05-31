import Link from "next/link";

export default function HomePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-panel px-4">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-500">Valenix</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">Continue to chat</h1>
        </div>
        <div className="flex gap-3">
          <Link
            className="flex h-11 flex-1 items-center justify-center rounded-md bg-ink px-4 text-sm font-semibold text-white"
            href="/login"
          >
            Log in
          </Link>
          <Link
            className="flex h-11 flex-1 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-gray-50"
            href="/signup"
          >
            Sign up
          </Link>
        </div>
      </section>
    </main>
  );
}
