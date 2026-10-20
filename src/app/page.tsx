import { Suspense } from "react";

import { InvoiceWorkspace } from "@/components/invoice/invoice-workspace";
import { WorkspaceSkeleton } from "@/components/invoice/workspace-skeleton";
import { demoInvoice } from "@/lib/invoice/demo-data";
import { createBlankInvoice } from "@/lib/invoice/new-invoice";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    // Rendered per request: the blank invoice gets today's date and a fresh number, and React
    // Hook Form's useFieldArray calls crypto.randomUUID() during render, which Cache Components
    // does not allow in the static prerender.
    <Suspense fallback={<WorkspaceSkeleton />}>
      {searchParams.then((params) => (
        <InvoiceWorkspace
          // `/?demo` opens the sample invoice (used by the browser tests and for demos).
          initialInvoice={params.demo !== undefined ? demoInvoice : createBlankInvoice()}
        />
      ))}
    </Suspense>
  );
}
