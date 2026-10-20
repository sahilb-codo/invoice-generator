// Minimal Chrome DevTools Protocol driver for local UI verification.
// Uses the global WebSocket of Node.js 22+; no extra dependencies. Set CHROME_PATH to override the browser.
import { spawn } from "node:child_process";
import { existsSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME =
  process.env.CHROME_PATH ??
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].find((p) => existsSync(p));
if (!CHROME) throw new Error("Chrome not found — set CHROME_PATH");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch({ port = 9333 } = {}) {
  const profile = mkdtempSync(join(tmpdir(), "cdp-"));
  const proc = spawn(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  let target;
  for (let i = 0; i < 50 && !target; i++) {
    try {
      target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(
        (t) => t.type === "page",
      );
    } catch {}
    if (!target) await sleep(200);
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let seq = 0;
  const pending = new Map();
  const listeners = [];
  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) rej(new Error(msg.error.message));
      else res(msg.result);
    } else listeners.forEach((l) => l(msg));
  });
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const id = ++seq;
      pending.set(id, { res, rej });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const errors = [];
  listeners.push((m) => {
    if (m.method === "Runtime.exceptionThrown")
      errors.push(
        m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text,
      );
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error")
      errors.push(m.params.args.map((a) => a.value ?? a.description).join(" "));
    if (m.method === "Page.javascriptDialogOpening")
      send("Page.handleJavaScriptDialog", { accept: true });
  });
  await send("Runtime.enable");
  // Headless pages are unfocused; without this, focus/blur events (used by form validation) never fire.
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await send("Page.enable");
  await send("DOM.enable");

  const page = {
    send,
    errors,
    sleep,
    listeners,
    async goto(url) {
      await send("Page.navigate", { url });
      await sleep(300);
      await page.waitFor("document.readyState === 'complete'");
    },
    async eval(expr) {
      const r = await send("Runtime.evaluate", {
        expression: expr,
        awaitPromise: true,
        returnByValue: true,
      });
      if (r.exceptionDetails)
        throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    async waitFor(expr, timeout = 10000) {
      const t0 = Date.now();
      while (Date.now() - t0 < timeout) {
        try {
          if (await page.eval(expr)) return true;
        } catch {}
        await sleep(100);
      }
      throw new Error("Timeout waiting for: " + expr);
    },
    async viewport(width, height, mobile = false) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile,
      });
      await sleep(300);
    },
    async screenshot(path, fullPage = false) {
      let clip;
      if (fullPage) {
        const m = await send("Page.getLayoutMetrics");
        clip = {
          x: 0,
          y: 0,
          width: m.cssContentSize.width,
          height: m.cssContentSize.height,
          scale: 1,
        };
      }
      const { data } = await send("Page.captureScreenshot", {
        format: "png",
        ...(clip ? { clip, captureBeyondViewport: true } : {}),
      });
      writeFileSync(path, Buffer.from(data, "base64"));
    },
    /** Sets an input/textarea value the way React expects and fires input + blur. */
    async fill(selector, value) {
      await page.eval(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) throw new Error('not found: ' + ${JSON.stringify(selector)});
        const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        el.focus(); Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(String(value))});
        el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); el.blur(); return true; })()`);
      await sleep(80);
    },
    async click(selector) {
      await page.eval(
        `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) throw new Error('not found: ' + ${JSON.stringify(selector)}); el.click(); return true; })()`,
      );
      await sleep(150);
    },
    async clickText(selector, text) {
      await page.eval(
        `(() => { const el = [...document.querySelectorAll(${JSON.stringify(selector)})].find(e => e.textContent.trim().includes(${JSON.stringify(text)})); if (!el) throw new Error('no ' + ${JSON.stringify(selector)} + ' with text ' + ${JSON.stringify(text)}); el.click(); return true; })()`,
      );
      await sleep(150);
    },
    /** Real pointer click at the element centre (needed for Radix triggers that act on mousedown). */
    async tap(selector, text) {
      const box = await page.eval(
        `(() => { const els = [...document.querySelectorAll(${JSON.stringify(selector)})]; const el = ${JSON.stringify(text ?? null)} === null ? els[0] : els.find(e => e.textContent.trim().includes(${JSON.stringify(text ?? "")})); if (!el) return null; el.scrollIntoView({block:"center"}); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`,
      );
      if (!box) throw new Error("tap target not found: " + selector + " " + (text ?? ""));
      for (const type of ["mouseMoved", "mousePressed", "mouseReleased"])
        await send("Input.dispatchMouseEvent", {
          type,
          x: box.x,
          y: box.y,
          button: "left",
          clickCount: 1,
        });
      await sleep(200);
    },
    async setFiles(selector, files) {
      const { root } = await send("DOM.getDocument");
      const { nodeId } = await send("DOM.querySelector", { nodeId: root.nodeId, selector });
      await send("DOM.setFileInputFiles", { nodeId, files });
      await sleep(400);
    },
    async close() {
      try {
        await send("Browser.close");
      } catch {}
      proc.kill();
    },
  };
  return page;
}

/** Tiny assertion collector. */
export function makeChecker() {
  const results = [];
  return {
    results,
    check(name, ok, detail = "") {
      results.push({ name, ok: !!ok, detail });
      console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
    },
    summary() {
      const failed = results.filter((r) => !r.ok).length;
      console.log(`\n${results.length - failed}/${results.length} checks passed`);
      return failed;
    },
  };
}
