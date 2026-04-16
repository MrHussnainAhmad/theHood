import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen px-6 py-16 bg-[radial-gradient(circle_at_20%_10%,#fff8ef_0%,#f7f3ea_35%,#ece5d8_100%)]">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-line bg-white/65 p-8 shadow-premium md:p-14">
        <p className="text-xs uppercase tracking-[0.18em] text-primary-700">404 - Lost in the layout</p>
        <h1 className="mt-4 text-[clamp(2.2rem,6vw,5rem)] text-ink">This page moved before we could style it.</h1>
        <p className="mt-5 max-w-2xl text-neutral-600">The link may be old, mistyped, or no longer active. Let us get you back to live pages.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn-primary">
            <ArrowLeft className="h-4 w-4" />
            Back Home
          </Link>
          <Link href="/services" className="btn-secondary">Browse Services</Link>
        </div>
      </section>
    </main>
  );
}
