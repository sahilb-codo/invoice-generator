import Link from "next/link";

import { Logo } from "@/components/app/logo";

interface AppHeaderProps {
  /** Context shown next to the logo, e.g. invoice number and status. */
  context?: React.ReactNode;
  /** Primary actions, right-aligned. */
  actions?: React.ReactNode;
}

export function AppHeader({ context, actions }: AppHeaderProps) {
  return (
    <header
      data-print="hide"
      className="bg-card/90 shadow-header supports-[backdrop-filter]:bg-card/75 sticky top-0 z-30 backdrop-blur"
    >
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="focus-visible:ring-ring/50 -ml-1 shrink-0 rounded-md p-1 outline-none focus-visible:ring-3"
          aria-label="InvoiceStudio home"
        >
          <Logo />
        </Link>
        {context ? (
          <>
            <span className="bg-border hidden h-5 w-px sm:block" aria-hidden />
            <div className="hidden min-w-0 items-center gap-2 sm:flex">{context}</div>
          </>
        ) : null}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">{actions}</div>
      </div>
    </header>
  );
}
