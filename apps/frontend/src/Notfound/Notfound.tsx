import { Link } from "react-router";

export const NotFound = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-16">
      <div className="relative w-full max-w-lg text-center">
        {/* Soft glow, same treatment as the hero image */}
        <div className="absolute inset-x-10 top-0 -z-10 h-48 rounded-full bg-(--color-primary-light) blur-3xl" />

        <span className="inline-block rounded-full bg-(--color-primary-light) px-4 py-1.5 text-sm font-semibold text-(--color-primary)">
          Error 404
        </span>

        <p className="mt-6 text-8xl font-extrabold leading-none tracking-[-0.02em] text-(--color-primary) sm:text-9xl">
          404
        </p>

        <h1 className="mt-6 text-2xl font-extrabold text-(--color-heading) sm:text-3xl">
          Page not found
        </h1>

        <p className="mx-auto mt-3 max-w-md text-base leading-[1.6] text-(--color-body)">
          Sorry, we couldn't find the page you're looking for. It may
          have been moved, deleted, or the link might be incorrect.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="w-full rounded-lg bg-(--color-primary) px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-(--color-primary-hover) hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) sm:w-auto"
          >
            Back to home
          </Link>

        </div>
      </div>
    </main>
  );
};