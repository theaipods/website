import { ApiError } from "./auth";

export type ContactInterest = { email: string };

export async function sendContactInterest(input: ContactInterest) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    throw new ApiError(503, "Contact email is not configured yet. Please email contact@theaipods.com directly.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [process.env.CONTACT_LEADS_TO || "contact@theaipods.com"],
      reply_to: input.email,
      subject: "New website interest - TheAIPods",
      text: `Someone asked to hear from TheAIPods.\n\nEmail: ${input.email}\nSource: Homepage contact form\n\nYou can reply directly to this email to contact them.`,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) throw new ApiError(502, "We couldn't send your request right now. Please try again or email contact@theaipods.com directly.");
}
