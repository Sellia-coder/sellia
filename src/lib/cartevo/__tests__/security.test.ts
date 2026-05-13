import { redactSecrets } from "../../security/redact";
import { rateLimit } from "../../security/rate-limit";
import {
  cartevoCollectRequestSchema,
  validatePhoneForCountry,
} from "../validation";
import { calculateSelliaCommission } from "../commission";
import {
  extractTransactionIdFromWebhook,
  hashWebhookBody,
} from "../webhook";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("❌ FAIL:", msg);
    throw new Error(msg);
  }
  console.log("✅", msg);
}

const redacted = redactSecrets({
  username: "kono",
  password: "mySecret123",
  client_key: "supersecret",
  data: {
    token: "eyJ0eXAi.eyJhYWE.zzz",
    nested: { authorization: "Bearer xyz" },
  },
});
assert(redacted.password === "[REDACTED]", "redact password");
assert(redacted.client_key === "[REDACTED]", "redact client_key");
assert(
  (redacted as { data: { nested: { authorization: string } } }).data.nested
    .authorization === "[REDACTED]",
  "redact nested authorization"
);
assert(redacted.username === "kono", "preserve non-sensitive fields");

const r1 = rateLimit("test:ip1", 3, 60_000);
assert(r1.allowed && r1.remaining === 2, "first call allowed");
const r2 = rateLimit("test:ip1", 3, 60_000);
assert(r2.allowed && r2.remaining === 1, "second call allowed");
const r3 = rateLimit("test:ip1", 3, 60_000);
assert(r3.allowed && r3.remaining === 0, "third call allowed");
const r4 = rateLimit("test:ip1", 3, 60_000);
assert(!r4.allowed, "fourth call blocked");

const validCollect = cartevoCollectRequestSchema.safeParse({
  operator: "mtn",
  country: "CM",
  phone_number: "237670000000",
  amount: 5000,
  currency: "XAF",
});
assert(validCollect.success, "valid collect request");

const negativeAmount = cartevoCollectRequestSchema.safeParse({
  operator: "mtn",
  country: "CM",
  phone_number: "237670000000",
  amount: -100,
  currency: "XAF",
});
assert(!negativeAmount.success, "negative amount blocked");

const invalidOperator = cartevoCollectRequestSchema.safeParse({
  operator: "fake",
  country: "CM",
  phone_number: "237670000000",
  amount: 5000,
  currency: "XAF",
});
assert(!invalidOperator.success, "invalid operator blocked");

const wrongPhoneFormat = cartevoCollectRequestSchema.safeParse({
  operator: "mtn",
  country: "CM",
  phone_number: "0670000000",
  amount: 5000,
  currency: "XAF",
});
assert(!wrongPhoneFormat.success, "wrong phone format blocked");

assert(validatePhoneForCountry("237670000000", "CM"), "valid CM phone");
assert(!validatePhoneForCountry("237100000000", "CM"), "invalid CM phone (wrong prefix)");
assert(!validatePhoneForCountry("237670000000", "CI"), "CM phone rejected for CI");

const c1 = calculateSelliaCommission(10000, "free");
assert(c1.commissionAmount === 600, "Free 6%");
const c2 = calculateSelliaCommission(10000, "pro");
assert(c2.commissionAmount === 400, "Pro 4%");

const valid = extractTransactionIdFromWebhook(
  JSON.stringify({
    event: "payment.collect",
    data: { transaction_id: "abc12345" },
  })
);
assert(valid.ok && valid.transactionId === "abc12345", "extract valid tx id");

const noBody = extractTransactionIdFromWebhook("");
assert(!noBody.ok, "reject empty body");

const badJson = extractTransactionIdFromWebhook("not json");
assert(!badJson.ok, "reject bad json");

const noTxId = extractTransactionIdFromWebhook(
  JSON.stringify({ event: "test", data: {} })
);
assert(!noTxId.ok, "reject missing tx id");

const sqlInjAttempt = extractTransactionIdFromWebhook(
  JSON.stringify({ event: "test", data: { transaction_id: "'; DROP TABLE--" } })
);
assert(!sqlInjAttempt.ok, "reject sql injection in tx id");

const h1 = hashWebhookBody("foo");
const h2 = hashWebhookBody("foo");
const h3 = hashWebhookBody("bar");
assert(h1 === h2, "same body = same hash");
assert(h1 !== h3, "different body = different hash");

console.log("\n🛡️  All security tests passed");
