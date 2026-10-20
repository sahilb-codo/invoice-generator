import { AppHeader } from "@/components/app/app-header";

/** Static loading shell shown while the invoice workspace streams in. */
export function WorkspaceSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col" aria-busy="true" aria-label="Loading invoice">
      <AppHeader />
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:px-8 lg:py-6">
        <div className="space-y-5 lg:space-y-6">
          <div className="bg-card shadow-card ring-foreground/[0.07] h-11 animate-pulse rounded-2xl ring-1" />
          {[240, 340, 280].map((height) => (
            <div
              key={height}
              className="bg-card shadow-card ring-foreground/[0.07] animate-pulse rounded-2xl ring-1"
              style={{ height }}
            />
          ))}
        </div>
        <div className="bg-desk hidden rounded-2xl p-5 lg:block">
          <div className="bg-paper shadow-paper h-[640px] animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  );
}
