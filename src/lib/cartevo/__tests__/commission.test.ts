import { calculateSelliaCommission } from "../commission";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error("❌ FAIL:", message);
    throw new Error(message);
  } else {
    console.log("✅", message);
  }
}

const t1 = calculateSelliaCommission(10000, "free");
assert(t1.commissionRate === 0.06, "Free plan rate is 6%");
assert(t1.commissionAmount === 600, "10000 * 6% = 600");
assert(t1.netAmount === 9400, "Net = 10000 - 600 = 9400");

const t2 = calculateSelliaCommission(10000, "pro");
assert(t2.commissionRate === 0.04, "Pro plan rate is 4%");
assert(t2.commissionAmount === 400, "10000 * 4% = 400");
assert(t2.netAmount === 9600, "Net = 10000 - 400 = 9600");

console.log("\n🎉 All commission tests passed");
