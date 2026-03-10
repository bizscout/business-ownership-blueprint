import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { Client } from "@hubspot/api-client";
import { Resend } from "resend";

// --- Schemas ---
const quizSubmissionSchema = z.object({
  firstName: z.string().min(1),
  email: z.string().email(),
  ownsBusiness: z.boolean(),
  revenueRange: z.string().nullable(),
  answers: z.array(z.number()).length(15),
});

// --- Scoring ---
function calculateAxisScores(answers: number[]) {
  const average = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  return {
    DI: average([answers[0], answers[1], answers[2]]),
    OD: average([answers[3], answers[4], answers[5]]),
    CR: average([answers[6], answers[7], answers[8]]),
    RT: average([answers[9], answers[10], answers[11]]),
    SV: average([answers[12], answers[13], answers[14]]),
  };
}

function calculateArchetypes(axes: { DI: number; OD: number; CR: number; RT: number; SV: number }) {
  return {
    Acquirer: axes.DI * 0.4 + axes.SV * 0.35 + axes.RT * 0.25,
    Operator: axes.OD * 0.4 + axes.DI * 0.35 + axes.RT * 0.25,
    Builder: axes.OD * 0.4 + axes.SV * 0.35 + axes.CR * 0.25,
    Architect: axes.SV * 0.4 + axes.CR * 0.35 + axes.OD * 0.25,
  };
}

// --- HubSpot ---
function getHubSpotClient() {
  if (!process.env.HUBSPOT_ACCESS_TOKEN) throw new Error("HUBSPOT_ACCESS_TOKEN not set");
  return new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });
}

// HubSpot contact creation is handled inline in the handler

// --- Resend ---
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

// --- Revenue mapping ---
const revenueMap: Record<string, string> = {
  "$0 - $250k": "0-250k",
  "$250k - $1M": "250k-1m",
  "$1M - $5M": "1m-5m",
  "$5M+": "5m+",
};

// --- Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // 1. Validate
  const parsed = quizSubmissionSchema.safeParse(req.body);
  if (!parsed.success) {
    console.log("[quiz] Validation failed:", parsed.error.flatten().fieldErrors);
    return res.status(400).json({
      message: "Invalid submission data",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const { firstName, email, ownsBusiness, answers } = parsed.data;
  const revenueRange = parsed.data.revenueRange
    ? revenueMap[parsed.data.revenueRange] ?? parsed.data.revenueRange
    : null;

  console.log(`[quiz] Submission from ${firstName} <${email}>`);

  // 2. Compute scores
  const axisScores = calculateAxisScores(answers);
  const archetypeScores = calculateArchetypes(axisScores);
  const sorted = Object.entries(archetypeScores).sort(([, a], [, b]) => b - a);
  const primaryArchetype = sorted[0][0];
  const ctaRoute = ownsBusiness
    ? "boardroom"
    : ["Acquirer", "Operator"].includes(primaryArchetype)
      ? "academy"
      : "boardroom";

  console.log(`[quiz] Archetype: ${primaryArchetype}, CTA: ${ctaRoute}`);

  // 3. Check for duplicate email
  const hubspot = getHubSpotClient();
  try {
    const searchResponse = await hubspot.crm.contacts.searchApi.doSearch({
      filterGroups: [{
        filters: [{ propertyName: "email", operator: "EQ", value: email }],
      }],
      properties: ["email", "blueprint_archetype"],
      limit: 1,
      after: "0",
      sorts: [],
    });

    if (searchResponse.total > 0 && searchResponse.results[0]?.properties?.blueprint_archetype) {
      console.log(`[hubspot] Duplicate submission blocked: ${email}`);
      return res.status(409).json({
        message: "This email has already been used to complete the Blueprint. Each email can only be used once.",
        code: "DUPLICATE_EMAIL",
      });
    }
  } catch (err: any) {
    console.error(`[hubspot] Search failed for ${email}:`, err.message);
    return res.status(502).json({ message: "Failed to verify your submission. Please try again." });
  }

  // 4. HubSpot — create contact, MUST succeed
  try {
    const properties: Record<string, string> = {
      email, firstname: firstName,
      owns_business: String(ownsBusiness),
      estimated_annual_revenue: revenueRange ?? "",
      blueprint_archetype: primaryArchetype,
      score_deal_instinct: axisScores.DI.toFixed(1),
      score_operator_depth: axisScores.OD.toFixed(1),
      score_capital_readiness: axisScores.CR.toFixed(1),
      score_risk_tolerance: axisScores.RT.toFixed(1),
      score_strategic_vision: axisScores.SV.toFixed(1),
      blueprint_cta_route: ctaRoute,
      blueprint_completed_at: new Date().toISOString(),
    };
    const hsResponse = await hubspot.crm.contacts.basicApi.create({ properties, associations: [] });
    console.log(`[hubspot] Contact created: ${email} (id: ${hsResponse?.id ?? "unknown"})`);
  } catch (err: any) {
    console.error(`[hubspot] FAILED for ${email}:`, err?.body?.message || err.message);
    return res.status(502).json({
      message: "Failed to record your submission. Please try again.",
    });
  }

  // 4. Resend — best effort
  let emailSent = false;
  let emailError: string | null = null;
  try {
    if (process.env.RESEND_API_KEY) {
      await sendResultsEmail({ to: email, firstName, primaryArchetype, axisScores, ctaRoute });
      emailSent = true;
      console.log(`[resend] Email sent to ${email}`);
    } else {
      emailError = "Email service not configured";
    }
  } catch (err: any) {
    emailError = err.message;
    console.error(`[resend] FAILED for ${email}:`, err.message);
  }

  return res.status(200).json({
    success: true,
    axisScores,
    primaryArchetype,
    ctaRoute,
    emailSent,
    emailError,
  });
}
