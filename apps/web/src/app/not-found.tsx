import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-6xl mb-6">🗺️</p>
      <h1 className="text-2xl font-bold text-text-primary mb-3">
        Page not found
      </h1>
      <p className="text-text-muted mb-8">
        The page you&apos;re looking for doesn&apos;t exist. But there&apos;s a
        whole world to explore.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/" className="btn-primary">
          Go home →
        </Link>
        <Link href="/cities" className="btn-secondary">
          Explore cities
        </Link>
      </div>
    </div>
  );
}
