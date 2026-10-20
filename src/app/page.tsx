import { Suspense } from "react";

import { InvoiceWorkspace } from "@/components/invoice/invoice-workspace";
import { WorkspaceSkeleton } from "@/components/invoice/workspace-skeleton";
import { demoInvoice } from "@/lib/invoice/demo-data";

export default function Home() {
  return (
    // React Hook Form's useFieldArray generates row keys with crypto.randomUUID() during render,
    // which Cache Components does not allow in the static prerender — render it per request.
    <Suspense fallback={<WorkspaceSkeleton />}>
      <InvoiceWorkspace initialInvoice={demoInvoice} />
    </Suspense>
  );
}
