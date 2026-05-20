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
assert(t1.commissionRate === 0.03, "Free plan rate is 3%");
assert(t1.commissionAmount === 300, "10000 * 3% = 300");
assert(t1.netAmount === 9700, "Net = 10000 - 300 = 9700");

const t2 = calculateSelliaCommission(10000, "pro");
assert(t2.commissionRate === 0.015, "Pro plan rate is 1.5%");
assert(t2.commissionAmount === 150, "10000 * 1.5% = 150");
assert(t2.netAmount === 9850, "Net = 10000 - 150 = 9850");

const t3 = calculateSelliaCommission(10000, "business");
assert(t3.commissionRate === 0.01, "Business plan rate is 1%");
assert(t3.commissionAmount === 100, "10000 * 1% = 100");

console.log("\n🎉 All commission tests passed");
