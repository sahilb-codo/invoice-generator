import { ReceiptText } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg shadow-sm">
        <ReceiptText className="size-4.5" strokeWidth={2.25} aria-hidden />
      </span>
      <span className="text-[15px] font-semibold tracking-tight">
        Invoice<span className="text-primary">Studio</span>
      </span>
    </span>
  );
}
