import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.warn("[email] RESEND_API_KEY missing — emails will fail to send.");
}

export const resend = new Resend(apiKey || "missing");

export const EMAIL_FROM = process.env.EMAIL_FROM || "Sellia <noreply@getsellia.com>";
