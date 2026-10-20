// Email checks through the UI (Phase 08). Requires a production build (npm run build).
// Starts a local fake Resend API and two `next start` instances, so no real email is sent:
//   - "configured": RESEND_* points at the local fake API with a test key
//   - "not configured": RESEND_API_KEY / EMAIL_FROM set to the .env.example placeholders
// Every email variable — including RESEND_BASE_URL — is passed explicitly (process.env wins over
// .env), so a developer's real Resend key in .env is never used by this script.
//   node scripts/e2e/email.e2e.mjs   (OUT=dir for screenshots)
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

import { startFakeResend } from "../../tests/support/fake-resend.mjs";
import { launch, makeChecker } from "./cdp.mjs";

const OUT = process.env.OUT;
const { check, summary } = makeChecker();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const API_KEY = "re_e2e_local_key";
const fake = await startFakeResend({ apiKey: API_KEY });

function startApp(port, env) {
  return spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    env: { ...process.env, ...env },
    stdio: "ignore",
  });
}
const configured = startApp(3125, {
  RESEND_API_KEY: API_KEY,
  EMAIL_FROM: "Northwind Studio <billing@northwind.example>",
  RESEND_BASE_URL: fake.url,
});
const unconfigured = startApp(3126, {
  RESEND_API_KEY: "re_your_api_key",
  EMAIL_FROM: "Your Business <billing@example.com>",
  RESEND_BASE_URL: fake.url,
});
for (const port of [3125, 3126]) {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`http://localhost:${port}`)).ok) break;
    } catch {}
    await sleep(250);
  }
}

const page = await launch();
const preview = `document.querySelector('[aria-label="Invoice preview"] article')`;
const dialog = `document.querySelector('[role="alertdialog"]')`;
const dialogText = () => page.eval(`${dialog}?.innerText ?? ''`);
const headerStatus = () => page.eval(`document.querySelector('header').innerText`);
const toastText = () =>
  page.eval(`document.querySelector('[data-sonner-toaster]')?.innerText ?? ''`);
const dialogSendDisabled = () =>
  page.eval(
    `[...${dialog}.querySelectorAll('button')].find(b => b.textContent.includes('Send invoice')).disabled`,
  );
async function openDialog() {
  await page.click('button[aria-label="Send invoice by email"]');
  await page.waitFor(`!!${dialog}`, 5000);
  await page.waitFor(`!${dialog}.innerText.includes('Checking email configuration')`, 5000);
}
async function sendFromDialog() {
  await page.eval(
    `[...${dialog}.querySelectorAll('button')].find(b => b.textContent.includes('Send invoice')).click(); true`,
  );
}

try {
  await page.viewport(1440, 1000);

  // 1. Successful send
  await page.goto("http://localhost:3125/?demo");
  await page.waitFor(`!!${preview}`);
  check("status starts as Draft", (await headerStatus()).includes("Draft"));
  await openDialog();
  let text = await dialogText();
  check(
    "dialog opens with summary",
    text.includes("Send invoice INV-2026-0042") &&
      text.includes("$8,091.39") &&
      text.includes("Nov 19, 2026"),
  );
  check(
    "recipient prefilled with customer email",
    (await page.eval(`document.querySelector('#send-recipient').value`)) ===
      "ava.thompson@brightline.example",
  );
  check("no setup warning when Resend is configured", !text.includes("Email is not set up"));
  await page.fill("#send-recipient", "developer@inbox.test");
  if (OUT) await page.screenshot(`${OUT}/p08-send-dialog.png`);
  await sendFromDialog();
  await page.waitFor(`!${dialog}`, 15000);
  await page.waitFor(
    `document.querySelector('[data-sonner-toaster]')?.innerText.includes('Invoice sent to')`,
    5000,
  );
  check(
    "success toast shown",
    (await toastText()).includes("Invoice sent to developer@inbox.test"),
  );
  check("status changes to Sent after Resend accepts", (await headerStatus()).includes("Sent"));
  check(
    "exactly one email sent to the chosen recipient",
    fake.sent.length === 1 && fake.sent[0].body.to[0] === "developer@inbox.test",
  );
  check(
    "email subject and body",
    fake.sent[0]?.body.subject ===
      "Invoice INV-2026-0042 from Northwind Studio — $8,091.39 due Nov 19, 2026" &&
      fake.sent[0].body.html.includes("$8,091.39") &&
      !fake.sent[0].body.html.includes("CC-4410"),
  );
  check(
    "PDF attached",
    fake.sent[0]?.body.attachments?.[0]?.filename === "Invoice-INV-2026-0042.pdf" &&
      Buffer.from(fake.sent[0].body.attachments[0].content, "base64").subarray(0, 5).toString() ===
        "%PDF-",
  );
  if (OUT) {
    await page.screenshot(`${OUT}/p08-sent.png`);
    writeFileSync(`${OUT}/p08-email.html`, fake.sent[0].body.html);
  }

  // 2. Invalid recipient
  await page.goto("http://localhost:3125/?demo");
  await page.waitFor(`!!${preview}`);
  await openDialog();
  await page.fill("#send-recipient", "not-an-email");
  await sendFromDialog();
  await page.waitFor(
    `${dialog}.innerText.includes('Enter a valid recipient email address.')`,
    5000,
  );
  check("invalid recipient shows inline error", true);
  check(
    "status stays Draft after invalid recipient",
    (await headerStatus()).includes("Draft") && fake.sent.length === 1,
  );

  // 3. Recipient refused by Resend
  await page.fill("#send-recipient", "nobody@rejected.test");
  await sendFromDialog();
  await page.waitFor(`${dialog}.innerText.includes('Resend rejected the message')`, 15000);
  check("Resend rejection shown in dialog", true);
  check("failure toast shown", (await toastText()).includes("Invoice not sent"));
  check(
    "status stays Draft after a failed send",
    (await headerStatus()).includes("Draft") && fake.sent.length === 1,
  );
  await page.eval(
    `[...${dialog}.querySelectorAll('button')].find(b => b.textContent.trim() === 'Cancel').click(); true`,
  );

  // 4. Invalid invoice is not sent
  await page.goto("http://localhost:3125/?demo");
  await page.waitFor(`!!${preview}`);
  const qty = await page.eval(`'#' + document.querySelector('input[id$="-qty"]').id`);
  await page.fill(qty, "0");
  await page.click('button[aria-label="Send invoice by email"]');
  await sleep(500);
  check("invalid invoice: dialog not opened", !(await page.eval(`!!${dialog}`)));
  check(
    "invalid invoice: toast asks to fix fields",
    (await toastText()).includes("Fix the highlighted fields before sending."),
  );
  check("invalid invoice: nothing sent", fake.sent.length === 1);

  // 5. Resend not configured
  await page.goto("http://localhost:3126/?demo");
  await page.waitFor(`!!${preview}`);
  await openDialog();
  text = await dialogText();
  check("not configured: setup message shown", text.includes("Email is not set up on the server"));
  check(
    "not configured: lists missing variables",
    text.includes("RESEND_API_KEY (missing)") && text.includes("EMAIL_FROM (missing)"),
    text.replace(/\n/g, " | "),
  );
  check("not configured: Send disabled", await dialogSendDisabled());
  if (OUT) await page.screenshot(`${OUT}/p08-not-configured.png`);
  check("not configured: status stays Draft", (await headerStatus()).includes("Draft"));
  check("not configured: nothing sent", fake.sent.length === 1);

  check(
    "no console errors / exceptions",
    page.errors.length === 0,
    page.errors.slice(0, 3).join(" | "),
  );
} catch (error) {
  check("e2e run completed", false, String(error));
} finally {
  await page.close();
  configured.kill();
  unconfigured.kill();
  await fake.close();
}
process.exit(summary() ? 1 : 0);
