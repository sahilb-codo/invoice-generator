// A local stand-in for the Resend HTTP API (POST /emails), used by tests so that no real email is
// sent and no real API key is needed. It mimics Resend's response and error shapes:
//   - Authorization must be "Bearer <apiKey>"           → else 403 invalid_api_key
//   - any recipient ending in "@rejected.test"          → 422 validation_error
//   - otherwise                                         → 200 { id }
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";

/**
 * @param {{ apiKey: string }} options
 * @returns {Promise<{ url: string, sent: Array<{ id: string, body: any, headers: import("node:http").IncomingHttpHeaders }>, close: () => Promise<void> }>}
 */
export async function startFakeResend({ apiKey }) {
  const sent = [];

  const server = createServer((req, res) => {
    const reply = (status, body) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
    };
    if (req.method !== "POST" || req.url !== "/emails") {
      return reply(404, { name: "not_found", statusCode: 404, message: "Not found" });
    }
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      if (req.headers.authorization !== `Bearer ${apiKey}`) {
        return reply(403, {
          name: "invalid_api_key",
          statusCode: 403,
          message: "API key is invalid",
        });
      }
      const body = JSON.parse(raw);
      const to = [].concat(body.to ?? []);
      if (to.some((address) => address.endsWith("@rejected.test"))) {
        return reply(422, {
          name: "validation_error",
          statusCode: 422,
          message: "You can only send testing emails to your own email address.",
        });
      }
      const id = randomUUID();
      sent.push({ id, body, headers: req.headers });
      reply(200, { id });
    });
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    sent,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}
