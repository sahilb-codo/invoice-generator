import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface FormSectionProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Optional control rendered in the section header, e.g. an "Add" button. */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function FormSection({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
}: FormSectionProps) {
  return (
    <section className={cn("bg-card shadow-card rounded-xl border", className)}>
      <header className="flex items-start gap-3 border-b px-4 py-3.5 sm:px-5">
        <span className="bg-accent text-accent-foreground mt-0.5 grid size-7 shrink-0 place-items-center rounded-md">
          <Icon className="size-3.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm leading-7 font-semibold">{title}</h2>
          {description ? (
            <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
