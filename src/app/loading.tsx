export default function Loading() {
  return (
    <main className="min-h-screen grid place-items-center px-6 bg-[radial-gradient(circle_at_top,#fff8ef_0%,#f7f3ea_40%,#ece5d8_100%)]">
      <div className="text-center">
        <div className="mx-auto mb-6 h-20 w-20 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-600">Preparing your workspace</p>
        <h1 className="mt-3 text-3xl text-ink">Curating details...</h1>
      </div>
    </main>
  );
}