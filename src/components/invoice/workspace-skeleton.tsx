import { AppHeader } from "@/components/app/app-header";

/** Static loading shell shown while the invoice workspace streams in. */
export function WorkspaceSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col" aria-busy="true" aria-label="Loading invoice">
      <AppHeader />
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:px-8 lg:py-8">
        <div className="space-y-5">
          {[220, 320, 260].map((height) => (
            <div
              key={height}
              className="bg-card shadow-card animate-pulse rounded-xl border"
              style={{ height }}
            />
          ))}
        </div>
        <div className="bg-paper shadow-paper hidden h-[640px] animate-pulse rounded-xl lg:block" />
      </div>
    </div>
  );
}
