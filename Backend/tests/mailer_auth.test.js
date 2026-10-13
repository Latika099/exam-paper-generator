import test from "node:test";
import assert from "node:assert/strict";
import { generateOTP, otpExpiry } from "../utils/otp.js";
import { getResendClient, sendMail } from "../utils/mailer.js";

test("generateOTP returns a 6-digit numeric string", () => {
  const otp = generateOTP();
  assert.equal(typeof otp, "string");
  assert.equal(otp.length, 6);
  assert.match(otp, /^\d{6}$/);
});

test("otpExpiry returns a valid future expiration timestamp", () => {
  const before = Date.now();
  const expiry = otpExpiry(10);
  const after = Date.now();
  assert.ok(expiry >= before + 10 * 60 * 1000);
  assert.ok(expiry <= after + 10 * 60 * 1000 + 1000);
});

test("getResendClient throws clean error when RESEND_API_KEY is unset", () => {
  const originalKey = process.env.RESEND_API_KEY;
  try {
    delete process.env.RESEND_API_KEY;
    assert.throws(
      () => getResendClient(),
      {
        name: "Error",
        message: "RESEND_API_KEY environment variable is not configured"
      }
    );
  } finally {
    if (originalKey) {
      process.env.RESEND_API_KEY = originalKey;
    }
  }
});

test("getResendClient instantiates Resend when API key is provided", () => {
  const originalKey = process.env.RESEND_API_KEY;
  try {
    process.env.RESEND_API_KEY = "re_test_dummy_key_12345";
    const client = getResendClient();
    assert.ok(client, "Resend client should be created");
    assert.ok(client.emails, "client.emails namespace should be available");
  } finally {
    if (originalKey) {
      process.env.RESEND_API_KEY = originalKey;
    } else {
      delete process.env.RESEND_API_KEY;
    }
  }
});

test("sendMail throws cleanly when RESEND_API_KEY is not set", async () => {
  const originalKey = process.env.RESEND_API_KEY;
  try {
    delete process.env.RESEND_API_KEY;
    await assert.rejects(
      async () => {
        await sendMail("test@example.com", "Test Subject", "<p>Test</p>");
      },
      {
        name: "Error",
        message: "RESEND_API_KEY environment variable is not configured"
      }
    );
  } finally {
    if (originalKey) {
      process.env.RESEND_API_KEY = originalKey;
    }
  }
});
