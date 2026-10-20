/**
 * Email delivery through the real server action and the real Resend SDK, pointed at a local fake
 * Resend API (tests/support/fake-resend.mjs). Nothing leaves the machine.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { demoInvoice } from "@/lib/invoice/demo-data";

import { startFakeResend } from "./support/fake-resend.mjs";

const API_KEY = "re_test_local_key";

let fake: Awaited<ReturnType<typeof startFakeResend>>;

beforeAll(async () => {
  fake = await startFakeResend({ apiKey: API_KEY });
});

afterAll(() => fake.close());

function setEmailEnv(overrides: Record<string, string> = {}) {
  Object.assign(process.env, {
    RESEND_API_KEY: API_KEY,
    EMAIL_FROM: "Northwind Studio <billing@northwind.example>",
    RESEND_BASE_URL: fake.url,
    ...overrides,
  });
}

/** Fresh module per test so the in-memory rate limiter starts empty. */
async function loadAction() {
  vi.resetModules();
  return import("@/app/actions/invoice-email");
}

beforeEach(() => {
  fake.sent.length = 0;
  vi.spyOn(console, "error").mockImplementation(() => {});
  setEmailEnv();
});

describe("sendInvoiceEmail (Resend API)", () => {
  it("sends the invoice and reports success with Resend's email id", async () => {
    const { sendInvoiceEmail } = await loadAction();
    const result = await sendInvoiceEmail({
      recipient: "ava@brightline.test",
      invoice: demoInvoice,
    });

    expect(fake.sent).toHaveLength(1);
    const [{ id, body, headers }] = fake.sent;
    expect(result).toMatchObject({
      ok: true,
      recipient: "ava@brightline.test",
      emailId: id,
      totalCents: 809_139,
    });
    expect(headers.authorization).toBe(`Bearer ${API_KEY}`);
    expect(body.to).toEqual(["ava@brightline.test"]);
    expect(body.from).toBe("Northwind Studio <billing@northwind.example>");
    expect(body.reply_to ?? body.replyTo).toEqual(
      expect.stringContaining("billing@northwind.example"),
    );
    expect(body.subject).toBe(
      "Invoice INV-2026-0042 from Northwind Studio — $8,091.39 due Nov 19, 2026",
    );
    expect(body.html).toContain("$8,091.39");
    expect(body.text).toContain("Due date: Nov 19, 2026");
    expect(body.html).not.toContain("CC-4410"); // hidden custom field

    // PDF attachment, generated on the server
    expect(body.attachments).toHaveLength(1);
    expect(body.attachments[0].filename).toBe("Invoice-INV-2026-0042.pdf");
    const pdf = Buffer.from(body.attachments[0].content, "base64");
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("recalculates totals on the server and ignores client-supplied totals", async () => {
    const { sendInvoiceEmail } = await loadAction();
    const tampered = { ...demoInvoice, totals: { totalCents: 1 }, totalCents: 1 };
    const result = await sendInvoiceEmail({ recipient: "ava@brightline.test", invoice: tampered });
    expect(result).toMatchObject({ ok: true, totalCents: 809_139 });
    expect(fake.sent[0].body.text).toContain("Total due: $8,091.39");
  });

  it("reports a missing configuration without calling Resend", async () => {
    setEmailEnv({ RESEND_API_KEY: "", EMAIL_FROM: "" });
    const { sendInvoiceEmail } = await loadAction();
    const result = await sendInvoiceEmail({
      recipient: "ava@brightline.test",
      invoice: demoInvoice,
    });
    expect(result).toMatchObject({
      ok: false,
      code: "EMAIL_NOT_CONFIGURED",
      missing: ["RESEND_API_KEY", "EMAIL_FROM"],
    });
    expect(fake.sent).toHaveLength(0);
  });

  it("rejects an invalid recipient before calling Resend", async () => {
    const { sendInvoiceEmail } = await loadAction();
    const result = await sendInvoiceEmail({ recipient: "not-an-email", invoice: demoInvoice });
    expect(result).toMatchObject({ ok: false, code: "INVALID_RECIPIENT" });
    expect(fake.sent).toHaveLength(0);
  });

  it("rejects an invalid invoice before calling Resend", async () => {
    const { sendInvoiceEmail } = await loadAction();
    const result = await sendInvoiceEmail({
      recipient: "ava@brightline.test",
      invoice: { ...demoInvoice, discountValue: 999_999 },
    });
    expect(result).toMatchObject({ ok: false, code: "INVALID_INVOICE" });
    expect(
      result.ok === false && result.code === "INVALID_INVOICE" && result.fieldErrors.discountValue,
    ).toBe("Discount cannot exceed the subtotal");
    expect(fake.sent).toHaveLength(0);
  });

  it("fails (not sent) when Resend rejects the API key", async () => {
    setEmailEnv({ RESEND_API_KEY: "re_wrong_key" });
    const { sendInvoiceEmail } = await loadAction();
    const result = await sendInvoiceEmail({
      recipient: "ava@brightline.test",
      invoice: demoInvoice,
    });
    expect(result).toEqual({
      ok: false,
      code: "SEND_FAILED",
      message: "Resend rejected the API key. Check RESEND_API_KEY.",
    });
    expect(fake.sent).toHaveLength(0);
  });

  it("fails (not sent) when Resend rejects the recipient", async () => {
    const { sendInvoiceEmail } = await loadAction();
    const result = await sendInvoiceEmail({
      recipient: "nobody@rejected.test",
      invoice: demoInvoice,
    });
    expect(result).toMatchObject({ ok: false, code: "SEND_FAILED" });
    expect(result.ok === false && result.message).toContain("resend.dev test sender");
    expect(fake.sent).toHaveLength(0);
  });

  it("fails (not sent) when the API is unreachable", async () => {
    setEmailEnv({ RESEND_BASE_URL: "http://127.0.0.1:1" });
    const { sendInvoiceEmail } = await loadAction();
    const result = await sendInvoiceEmail({
      recipient: "ava@brightline.test",
      invoice: demoInvoice,
    });
    expect(result).toEqual({
      ok: false,
      code: "SEND_FAILED",
      message: "The email could not be sent. Check your connection and try again.",
    });
  });

  it("rate-limits bursts of sends", async () => {
    const { sendInvoiceEmail } = await loadAction();
    const results = [];
    for (let i = 0; i < 6; i++) {
      results.push(
        await sendInvoiceEmail({ recipient: `r${i}@brightline.test`, invoice: demoInvoice }),
      );
    }
    expect(results.slice(0, 5).every((r) => r.ok)).toBe(true);
    expect(results[5]).toMatchObject({ ok: false, code: "RATE_LIMITED" });
    expect(fake.sent).toHaveLength(5);
  });

  it("getEmailStatus reports variable names only", async () => {
    setEmailEnv({ EMAIL_FROM: "" });
    const { getEmailStatus } = await loadAction();
    const status = await getEmailStatus();
    expect(status).toEqual({ configured: false, missing: ["EMAIL_FROM"], invalid: [] });
    expect(JSON.stringify(status)).not.toContain(API_KEY);
  });
});
