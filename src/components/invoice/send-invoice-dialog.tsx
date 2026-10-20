"use client";

import { AlertTriangle, Loader2, Mail, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import {
  getEmailStatus,
  sendInvoiceEmail,
  type EmailStatus,
  type SendInvoiceResult,
} from "@/app/actions/invoice-email";
import { FormField } from "@/components/invoice/form-field";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateTotals } from "@/lib/invoice/calculations";
import { formatCents, formatDate } from "@/lib/invoice/format";
import type { InvoiceData } from "@/lib/invoice/types";

type Failure = Extract<SendInvoiceResult, { ok: false }>;

/**
 * "Send invoice" button + confirmation dialog. The form is validated first; the server action
 * validates again, recalculates totals and sends through Resend. Status becomes Sent only after
 * Resend accepts the message.
 */
export function SendInvoiceButton() {
  const { trigger, getValues, setValue } = useFormContext<InvoiceData>();
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [summary, setSummary] = useState<{
    number: string;
    customer: string;
    total: string;
    due: string;
  } | null>(null);
  const [checking, startChecking] = useTransition();
  const [sending, startSending] = useTransition();

  async function openDialog() {
    const valid = await trigger(undefined, { shouldFocus: true });
    if (!valid) {
      toast.error("Fix the highlighted fields before sending.");
      return;
    }
    const invoice = getValues();
    setSummary({
      number: invoice.invoiceNumber,
      customer: invoice.customer.company || invoice.customer.name,
      total: formatCents(calculateTotals(invoice).totalCents),
      due: formatDate(invoice.dueDate),
    });
    setRecipient(invoice.customer.email);
    setFailure(null);
    setStatus(null);
    setOpen(true);
    startChecking(async () => {
      const result = await getEmailStatus();
      setStatus(result);
    });
  }

  function send() {
    setFailure(null);
    startSending(async () => {
      const result = await sendInvoiceEmail({ recipient, invoice: getValues() });
      if (result.ok) {
        setValue("status", "SENT", { shouldDirty: true });
        setOpen(false);
        toast.success(`Invoice sent to ${result.recipient}`, {
          description: `${summary?.number} · ${formatCents(result.totalCents)}`,
        });
        return;
      }
      setFailure(result);
      if (result.code === "EMAIL_NOT_CONFIGURED") {
        setStatus({ configured: false, missing: result.missing, invalid: result.invalid });
      } else if (result.code === "INVALID_INVOICE") {
        setOpen(false);
        await trigger(undefined, { shouldFocus: true });
        toast.error(result.message);
      } else {
        toast.error("Invoice not sent", { description: result.message });
      }
    });
  }

  const notConfigured = status?.configured === false ? status : null;
  const recipientError = failure?.code === "INVALID_RECIPIENT" ? failure.message : undefined;
  const sendError =
    failure && (failure.code === "SEND_FAILED" || failure.code === "RATE_LIMITED")
      ? failure.message
      : null;

  return (
    <>
      <Button size="lg" onClick={openDialog} aria-label="Send invoice by email">
        <Mail aria-hidden />
        <span className="hidden sm:inline">Send invoice</span>
      </Button>

      <AlertDialog open={open} onOpenChange={(next) => !sending && setOpen(next)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Send invoice {summary?.number}</AlertDialogTitle>
            <AlertDialogDescription>
              Emails an invoice summary to your customer through Resend.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-4">
            <FormField id="send-recipient" label="Send to" error={recipientError}>
              <Input
                id="send-recipient"
                type="email"
                autoComplete="email"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                aria-invalid={recipientError ? true : undefined}
                aria-describedby={recipientError ? "send-recipient-error" : undefined}
                className="h-9"
                disabled={sending}
              />
            </FormField>

            <dl className="bg-muted/50 numeric grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg border p-3 text-sm">
              <dt className="text-muted-foreground">Customer</dt>
              <dd className="truncate text-right font-medium">{summary?.customer}</dd>
              <dt className="text-muted-foreground">Amount due</dt>
              <dd className="text-primary text-right font-semibold">{summary?.total}</dd>
              <dt className="text-muted-foreground">Due date</dt>
              <dd className="text-right font-medium">{summary?.due}</dd>
            </dl>

            {checking ? (
              <p className="text-muted-foreground flex items-center gap-2 text-xs">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Checking email configuration…
              </p>
            ) : null}

            {notConfigured ? (
              <div
                role="alert"
                className="border-warning/30 bg-warning-soft text-foreground rounded-lg border p-3 text-sm"
              >
                <p className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="text-warning size-4 shrink-0" aria-hidden />
                  Email is not set up on the server
                </p>
                <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                  Set these variables in <code className="font-mono">.env</code> (see{" "}
                  <code className="font-mono">.env.example</code>) and restart the server.
                </p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                  {[
                    ...notConfigured.missing.map((name) => ({ name, note: "missing" })),
                    ...notConfigured.invalid.map((name) => ({ name, note: "invalid" })),
                  ].map(({ name, note }) => (
                    <li key={name} className="bg-background rounded border px-1.5 py-0.5 font-mono">
                      {name} <span className="text-muted-foreground font-sans">({note})</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {sendError ? (
              <p
                role="alert"
                className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm"
              >
                {sendError}
              </p>
            ) : null}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={sending}>Cancel</AlertDialogCancel>
            <Button
              onClick={send}
              disabled={sending || checking || !!notConfigured || !recipient.trim()}
            >
              {sending ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
              {sending ? "Sending…" : "Send invoice"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
