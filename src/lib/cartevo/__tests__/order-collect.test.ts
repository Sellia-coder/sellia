import {
  PAYMENT_STATUS,
  ORDER_STATUS,
  PAYMENT_METHOD,
  isOrderPaid,
  isOrderActive,
  computeRefundDeadline,
  ESCROW_REFUND_DAYS,
} from "../order-status";
import {
  OPERATORS_CATALOG,
  getCountryInfo,
  getOperatorInfo,
  normalizePhoneNumber,
  getDefaultCountry,
} from "../operators-catalog";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("❌ FAIL:", msg);
    throw new Error(msg);
  }
  console.log("✅", msg);
}

assert(PAYMENT_STATUS.PAID_ESCROW === "paid_escrow", "paid_escrow constant");
assert(ORDER_STATUS.PAID_ESCROW === "paid_escrow", "order paid_escrow constant");
assert(
  PAYMENT_METHOD.ONLINE_MOBILE_MONEY === "online_mobile_money",
  "MM constant"
);

assert(isOrderPaid(PAYMENT_STATUS.PAID_ESCROW), "PAID_ESCROW is paid");
assert(isOrderPaid(PAYMENT_STATUS.PAID_OFFLINE), "PAID_OFFLINE is paid");
assert(!isOrderPaid(PAYMENT_STATUS.PENDING), "PENDING is not paid");
assert(isOrderActive(ORDER_STATUS.PENDING), "PENDING is active");
assert(!isOrderActive(ORDER_STATUS.CANCELLED), "CANCELLED is not active");

const now = new Date("2026-05-13T12:00:00Z");
const deadline = computeRefundDeadline(now);
const diffMs = deadline.getTime() - now.getTime();
const diffDays = diffMs / (1000 * 60 * 60 * 24);
assert(Math.round(diffDays) === ESCROW_REFUND_DAYS, "refund deadline 6 days");

assert(Object.keys(OPERATORS_CATALOG).length === 16, "16 countries");

const cm = getCountryInfo("CM");
assert(cm !== null && cm.name === "Cameroun", "CM is Cameroun");
assert(cm!.currency === "XAF", "CM currency XAF");
assert(cm!.operators.length === 2, "CM has 2 operators (MTN + Orange)");

const ci = getCountryInfo("CI");
assert(ci!.operators.length === 4, "CI has 4 operators");

const xx = getCountryInfo("XX");
assert(xx === null, "Unknown country returns null");

const mtnCm = getOperatorInfo("CM", "mtn");
assert(mtnCm !== null && mtnCm.code === "mtn", "MTN CM exists");

const waveSn = getOperatorInfo("SN", "wave");
assert(waveSn !== null, "Wave Senegal exists");

const waveCm = getOperatorInfo("CM", "wave");
assert(waveCm === null, "Wave not in Cameroon");

const def1 = getDefaultCountry("CM");
assert(def1.code === "CM", "default CM");
const def2 = getDefaultCountry("XX");
assert(def2.code === "CM", "fallback to CM");
const def3 = getDefaultCountry(null);
assert(def3.code === "CM", "null fallback to CM");

assert(
  normalizePhoneNumber("670000000", "CM") === "237670000000",
  "normalize CM phone (no prefix)"
);
assert(
  normalizePhoneNumber("0670000000", "CM") === "237670000000",
  "normalize CM phone (leading 0)"
);
assert(
  normalizePhoneNumber("+237 67 00 00 00 0", "CM") === "237670000000",
  "normalize CM phone with spaces"
);
assert(
  normalizePhoneNumber("237670000000", "CM") === "237670000000",
  "already normalized stays the same"
);

console.log("\n🎉 All order-collect tests passed");
