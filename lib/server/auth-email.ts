import { readFile } from "node:fs/promises";
import path from "node:path";

export type OtpPurpose = "signup" | "reset";

export function requireAuthMail() {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    throw new Error("Email verification is not configured. Set RESEND_API_KEY and RESEND_FROM on the server.");
  }
}

export async function deliverAuthCode(email: string, code: string, purpose: OtpPurpose) {
  requireAuthMail();
  const title = purpose === "reset" ? "Reset your password" : "Verify your work email";
  const explanation = purpose === "reset"
    ? "Use this code to choose a new password for your TheAIPods account."
    : "One quick check, then your workspace is ready to begin.";
  // CID works in local development too; the recipient need not reach localhost.
  const logo = await readFile(path.join(process.cwd(), "public/brand/official-logo.jpg"));
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM, to: [email], subject: `${title} - TheAIPods`,
      text: `${title}\n\n${explanation}\n\nYour code: ${code}\n\nExpires in 10 minutes. Never share this code. If you did not request this email, ignore it.`,
      html: `<!doctype html><html><body style="margin:0;background:#faf9f6;font-family:Arial,sans-serif;color:#1d2940"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px"><table role="presentation" width="480" style="max-width:100%;background:white;border:1px solid #dde2ea;border-radius:20px" cellpadding="0" cellspacing="0"><tr><td style="padding:36px"><img src="cid:theaipods-logo" alt="TheAIPods" width="180" style="display:block;max-width:100%;height:auto;margin-bottom:32px"><p style="font-size:12px;color:#3459a6;letter-spacing:2px">YOUR WORKSPACE, SECURED</p><h1 style="font-size:26px;line-height:1.25">${title}</h1><p style="color:#5d6678;line-height:1.7">${explanation}</p><div style="padding:22px 12px;margin:26px 0;background:#e7eefb;border-radius:12px;text-align:center;font-size:36px;font-weight:bold;letter-spacing:8px;color:#244784">${code}</div><p style="font-size:14px;line-height:1.7;color:#5d6678">This code expires in <strong>10 minutes</strong>. Never share it with anyone.</p><p style="font-size:12px;line-height:1.6;color:#5d6678;border-top:1px solid #dde2ea;padding-top:20px">Didn't request this? You can safely ignore this email. Your password stays unchanged.</p></td></tr></table></td></tr></table></body></html>`,
      attachments: [{ filename: "theaipods-logo.jpg", content: logo.toString("base64"), content_id: "theaipods-logo" }],
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Email delivery failed.");
}
