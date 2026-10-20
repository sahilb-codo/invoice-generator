import { CircleDashed, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/lib/invoice/types";

const STATUS_STYLES: Record<
  InvoiceStatus,
  { label: string; className: string; icon: typeof CircleDashed }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-secondary text-secondary-foreground ring-border",
    icon: CircleDashed,
  },
  SENT: {
    label: "Sent",
    className: "bg-success-soft text-success ring-success/20",
    icon: Send,
  },
};

export function StatusBadge({ status, className }: { status: InvoiceStatus; className?: string }) {
  const { label, className: tone, icon: Icon } = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium ring-1 ring-inset",
        tone,
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {label}
    </span>
  );
}
