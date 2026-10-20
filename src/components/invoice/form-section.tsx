import type { LucideIcon } from "lucide-react";

import { EDITOR_SECTIONS, type EditorSectionId } from "@/components/invoice/editor/sections";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  /** Anchor id; also determines the step number shown in the header. */
  id: EditorSectionId;
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Optional control rendered in the section header, e.g. an "Add" button. */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function FormSection({
  id,
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
}: FormSectionProps) {
  const step = EDITOR_SECTIONS.findIndex((section) => section.id === id) + 1;
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "bg-card shadow-card ring-foreground/[0.07] scroll-mt-32 overflow-hidden rounded-2xl ring-1 lg:scroll-mt-36",
        className,
      )}
    >
      <header className="from-accent/80 via-accent/25 to-card flex items-center gap-3.5 border-b bg-linear-to-r px-4 py-4 sm:px-6">
        <span className="bg-primary text-primary-foreground shadow-primary/25 grid size-10 shrink-0 place-items-center rounded-xl shadow-md">
          <Icon className="size-[18px]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-primary text-[10.5px] leading-4 font-semibold tracking-[0.14em] uppercase">
            Step {step} of {EDITOR_SECTIONS.length}
          </p>
          <h2 id={headingId} className="text-[15px] leading-6 font-semibold tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 self-center">{action}</div> : null}
      </header>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}
