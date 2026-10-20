import { describe, expect, it } from "vitest";

import { readEmailConfig } from "./config";

const complete = {
  RESEND_API_KEY: "re_test_123",
  EMAIL_FROM: "Northwind <billing@northwind.example>",
};

describe("readEmailConfig", () => {
  it("reads a complete configuration", () => {
    expect(readEmailConfig(complete)).toEqual({
      ok: true,
      config: {
        apiKey: "re_test_123",
        from: "Northwind <billing@northwind.example>",
        baseUrl: undefined,
      },
    });
  });

  it("reports every missing variable", () => {
    expect(readEmailConfig({})).toEqual({
      ok: false,
      missing: ["RESEND_API_KEY", "EMAIL_FROM"],
      invalid: [],
    });
  });

  it("treats .env.example placeholders as not configured", () => {
    expect(
      readEmailConfig({
        RESEND_API_KEY: "re_your_api_key",
        EMAIL_FROM: "Your Business <billing@example.com>",
      }),
    ).toEqual({ ok: false, missing: ["RESEND_API_KEY", "EMAIL_FROM"], invalid: [] });
  });

  it("flags values that cannot be right", () => {
    expect(
      readEmailConfig({
        RESEND_API_KEY: "sk_live_abc",
        EMAIL_FROM: "not an address",
        RESEND_BASE_URL: "::nope",
      }),
    ).toEqual({
      ok: false,
      missing: [],
      invalid: ["RESEND_API_KEY", "EMAIL_FROM", "RESEND_BASE_URL"],
    });
  });

  it("accepts a bare sender address and an API URL override", () => {
    const result = readEmailConfig({
      ...complete,
      EMAIL_FROM: "onboarding@resend.dev",
      RESEND_BASE_URL: "http://127.0.0.1:4010",
    });
    expect(result.ok && result.config).toMatchObject({
      from: "onboarding@resend.dev",
      baseUrl: "http://127.0.0.1:4010",
    });
  });
});
