import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { Resend } from "resend";

const resendRetrySchema = z.object({
  firstName: z.string().min(1),
  email: z.string().email(),
  primaryArchetype: z.string(),
  axisScores: z.object({
    DI: z.number(),
    OD: z.number(),
    CR: z.number(),
    RT: z.number(),
    SV: z.number(),
  }),
  ctaRoute: z.string(),
});

function sendResultsEmail(data: {
  to: string;
  firstName: string;
  primaryArchetype: string;
  axisScores: { DI: number; OD: number; CR: number; RT: number; SV: number };
  ctaRoute: string;
}) {
  if (!process.env.RESEND_API_KEY) throw new Error("Resend API key not configured");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const axisNames: Record<string, string> = {
    DI: "Deal Instinct", OD: "Operator Depth", CR: "Capital Readiness",
    RT: "Risk Tolerance", SV: "Strategic Vision",
  };

  const scoreRows = Object.entries(data.axisScores)
    .map(([key, val]) =>
      `<tr>
        <td style="padding: 8px 16px; border-bottom: 1px solid #E5E0D8; font-family: Georgia, serif; color: #1F1E1C;">${axisNames[key]}</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #E5E0D8; text-align: right; font-weight: bold; color: #52130C;">${val.toFixed(1)} / 10</td>
      </tr>`
    ).join("");

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1F1E1C; background: #F0EDE4; padding: 40px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #52130C; font-weight: bold;">Business Ownership Blueprint</p>
      </div>
      <h1 style="font-size: 28px; text-align: center; margin-bottom: 8px;">
        Your Archetype: <span style="color: #52130C; font-style: italic;">The ${data.primaryArchetype}</span>
      </h1>
      <p style="text-align: center; color: #1F1E1C; opacity: 0.7; margin-bottom: 32px;">
        Hi ${data.firstName}, here's your personalized blueprint summary.
      </p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; background: white;">
        <thead>
          <tr>
            <th style="padding: 12px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #1F1E1C; opacity: 0.5; border-bottom: 2px solid #52130C;">Dimension</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #1F1E1C; opacity: 0.5; border-bottom: 2px solid #52130C;">Score</th>
          </tr>
        </thead>
        <tbody>${scoreRows}</tbody>
      </table>
      <div style="text-align: center; margin-top: 32px;">
        <p style="color: #1F1E1C; opacity: 0.6; font-size: 14px;">Visit your full results page for detailed strategic guidance.</p>
      </div>
      <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #E5E0D8;">
        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #1F1E1C; opacity: 0.4;">Contrarian Thinking</p>
      </div>
    </div>
  `;

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Blueprint <noreply@example.com>",
    to: data.to,
    subject: `${data.firstName}, Your Business Ownership Blueprint is Ready`,
    html,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const parsed = resendRetrySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const { firstName, email, primaryArchetype, axisScores, ctaRoute } = parsed.data;
  console.log(`[resend] Retry for ${firstName} <${email}>`);

  try {
    if (!process.env.RESEND_API_KEY) {
      return res.status(503).json({ message: "Email service not configured" });
    }
    await sendResultsEmail({ to: email, firstName, primaryArchetype, axisScores, ctaRoute });
    console.log(`[resend] Retry email sent to ${email}`);
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error(`[resend] Retry FAILED for ${email}:`, err.message);
    return res.status(502).json({ message: "Failed to send email. Please try again." });
  }
}
