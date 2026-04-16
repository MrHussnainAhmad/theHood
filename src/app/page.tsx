import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles, TimerReset, Wrench } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import ReviewsSection from "@/components/home/ReviewsSection";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === "ADMIN") redirect("/admin");
    if (session.user.role === "PROVIDER") redirect("/provider");
    redirect("/dashboard");
  }

  return (
    <div className="texture-grain min-h-screen">
      <Navbar />

      <main className="px-4 pb-20 pt-8 xs:px-6 md:px-10 lg:px-16">
        <section className="mx-auto grid w-full max-w-[86rem] gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="relative overflow-hidden rounded-[2rem] border border-line/80 bg-[linear-gradient(140deg,#fff8ef_0%,#f4ead9_60%,#efe1ce_100%)] p-7 sm:p-10 lg:p-14">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-300/60 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-700">
              <Sparkles className="h-3.5 w-3.5" />
              Crafted Home Care
            </p>
            <h1 className="fluid-title max-w-3xl text-balance text-ink">
              Spaces cared for by humans who treat details like art.
            </h1>
            <p className="fluid-subtitle mt-6 max-w-2xl text-neutral-700">
              Hood connects homeowners with trusted providers for cleaning, repairs, maintenance, and specialist work across your city.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/services" className="btn-primary">
                Explore Services
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/register" className="btn-secondary">
                Become Consumer or Provider
              </Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {["500+ clients", "1200+ jobs", "4.9 avg rating", "24h support"].map((item) => (
                <div key={item} className="rounded-2xl border border-line/70 bg-white/70 px-3 py-3 text-center text-neutral-700">
                  {item}
                </div>
              ))}
            </div>
          </article>

          <aside className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <div className="card-hover relative overflow-hidden">
              <p className="text-xs uppercase tracking-[0.16em] text-accent-700">Provider Mode</p>
              <h2 className="mt-3 text-3xl text-ink">Offer your service, manage your own orders.</h2>
              <p className="mt-3 text-sm text-neutral-600">Create listings, update availability, and move jobs through status in your provider workspace.</p>
            </div>
            <div className="card-hover bg-[linear-gradient(130deg,#eaf6f2_0%,#d9eee8_100%)]">
              <p className="text-xs uppercase tracking-[0.16em] text-accent-800">Consumer Mode</p>
              <h2 className="mt-3 text-3xl text-ink">Book quickly, track transparently.</h2>
              <p className="mt-3 text-sm text-neutral-700">Check area availability, share requirements, and follow each service from booking to completion.</p>
            </div>
          </aside>
        </section>

        <section id="how" className="mx-auto mt-20 w-full max-w-[86rem]">
          <div className="mb-10 flex items-end justify-between gap-4">
            <h2 className="text-[clamp(1.8rem,4vw,3.25rem)] text-ink">Why Hood feels different</h2>
            <p className="max-w-sm text-sm text-neutral-600">No bloated marketplace noise. Just clear workflows, trusted people, and reliable execution.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-12">
            <div className="card md:col-span-7 lg:col-span-6">
              <ShieldCheck className="h-6 w-6 text-primary-600" />
              <h3 className="mt-4 text-2xl text-ink">Verified providers, safer decisions</h3>
              <p className="mt-3 text-neutral-600">Profiles are tied to real accounts, with optional professional CV links and platform-level moderation.</p>
            </div>
            <div className="card md:col-span-5 lg:col-span-3">
              <TimerReset className="h-6 w-6 text-accent-700" />
              <h3 className="mt-4 text-xl text-ink">Faster booking loop</h3>
              <p className="mt-3 text-sm text-neutral-600">From service selection to scheduling and payment in one clean flow.</p>
            </div>
            <div className="card md:col-span-12 lg:col-span-3">
              <Wrench className="h-6 w-6 text-primary-700" />
              <h3 className="mt-4 text-xl text-ink">Full order traceability</h3>
              <p className="mt-3 text-sm text-neutral-600">Status updates, notes, and review outcomes stay visible after completion.</p>
            </div>
          </div>
        </section>

        <section id="reviews" className="mx-auto mt-20 w-full max-w-[86rem]">
          <ReviewsSection />
        </section>

        <section className="mx-auto mt-20 w-full max-w-[86rem] overflow-hidden rounded-[2rem] border border-line bg-[linear-gradient(115deg,#1d3a32_0%,#2f7a66_40%,#8f2e1b_100%)] p-8 text-paper sm:p-12">
          <h2 className="max-w-3xl text-[clamp(1.8rem,4.8vw,4rem)] text-balance">Built for both sides of the work.</h2>
          <p className="mt-4 max-w-2xl text-paper/85">Create an account as a consumer to book trusted providers, or join as a provider and grow your service business.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="inline-flex min-h-11 items-center justify-center rounded-full bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:translate-y-[-2px]">Create Account</Link>
            <Link href="/services" className="inline-flex min-h-11 items-center justify-center rounded-full border border-paper/50 px-6 py-3 text-sm font-semibold text-paper transition hover:bg-paper/10">See Service Catalog</Link>
          </div>
        </section>
      </main>
    </div>
  );
}