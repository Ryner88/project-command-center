"use client";
export default function ErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="stack">
      <section className="frame stack">
        <span className="eyebrow">Request failed</span>
        <h1>This page could not be loaded.</h1>
        <p>
          The service may be restarting or the database may be unavailable. Wait a moment, then try
          again.
        </p>
        <button className="cta" onClick={reset}>
          Try again
        </button>
      </section>
    </main>
  );
}
