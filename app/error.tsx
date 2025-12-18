"use client";

export default function ErrorPage({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card card-md bg-base-100 w-full max-w-lg shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-error">Something went wrong!</h2>
          <p className="text-base-content/70">
            An error occurred while loading this page.
          </p>
          {process.env.NODE_ENV === "development" && error.message && (
            <div className="alert alert-error mt-2">
              <code className="text-xs">{error.message}</code>
            </div>
          )}
          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={() => reset()}>
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
