import { randomBytes } from "crypto";

export function generateVisitorToken(): string {
  return randomBytes(32).toString("hex");
}
