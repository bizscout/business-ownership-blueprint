import type { Express } from "express";
import { type Server } from "http";
import { quizSubmissionSchema, resendRetrySchema } from "@shared/schema";
import { calculateAxisScores, calculateArchetypes } from "@shared/scoring";
import { checkContactExists, createHubSpotContact } from "./services/hubspot";
import { sendResultsEmail } from "./services/resend";
import { log } from "./index";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Submit quiz — HubSpot is a hard blocker, Resend is best-effort
  app.post("/api/quiz/submit", async (req, res) => {
    log(`Received quiz submission`, "quiz");

    // 1. Validate
    const parsed = quizSubmissionSchema.safeParse(req.body);
    if (!parsed.success) {
      log(`Validation failed: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`, "quiz");
      return res.status(400).json({
        message: "Invalid submission data",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { firstName, email, ownsBusiness, answers } = parsed.data;
    log(`Validated submission for ${firstName} <${email}>`, "quiz");

    // Map display labels to HubSpot internal values
    const revenueMap: Record<string, string> = {
      "$0 - $250k": "0-250k",
      "$250k - $1M": "250k-1m",
      "$1M - $5M": "1m-5m",
      "$5M+": "5m+",
    };
    const revenueRange = parsed.data.revenueRange
      ? revenueMap[parsed.data.revenueRange] ?? parsed.data.revenueRange
      : null;

    // 2. Compute scores server-side
    const axisScores = calculateAxisScores(answers);
    const archetypeScores = calculateArchetypes(axisScores);
    const sorted = Object.entries(archetypeScores).sort(([, a], [, b]) => b - a);
    const primaryArchetype = sorted[0][0];
    const ctaRoute = ownsBusiness
      ? "boardroom"
      : ["Acquirer", "Operator"].includes(primaryArchetype)
        ? "academy"
        : "boardroom";

    log(`Computed scores — Archetype: ${primaryArchetype}, CTA: ${ctaRoute}`, "quiz");
    log(`Axis scores: DI=${axisScores.DI.toFixed(1)} OD=${axisScores.OD.toFixed(1)} CR=${axisScores.CR.toFixed(1)} RT=${axisScores.RT.toFixed(1)} SV=${axisScores.SV.toFixed(1)}`, "quiz");

    // 3. Check for duplicate email
    log(`Checking if contact exists: ${email}...`, "hubspot");
    try {
      const exists = await checkContactExists(email);
      if (exists) {
        log(`Duplicate submission blocked: ${email}`, "hubspot");
        return res.status(409).json({
          message: "This email has already been used to complete the Blueprint. Each email can only be used once.",
          code: "DUPLICATE_EMAIL",
        });
      }
    } catch (err: any) {
      log(`HubSpot search failed for ${email}: ${err.message}`, "hubspot");
      return res.status(502).json({
        message: "Failed to verify your submission. Please try again.",
      });
    }

    // 4. HubSpot — MUST succeed or we block
    log(`Creating contact in HubSpot: ${email}...`, "hubspot");
    try {
      const hsResponse = await createHubSpotContact({
        email,
        firstName,
        ownsBusiness,
        revenueRange,
        axisScores,
        primaryArchetype,
        ctaRoute,
      });
      log(`HubSpot contact created: ${email} (id: ${hsResponse?.id ?? "unknown"})`, "hubspot");
    } catch (err: any) {
      log(`HubSpot create FAILED for ${email}: ${err.message}`, "hubspot");
      return res.status(502).json({
        message: "Failed to record your submission. Please try again.",
      });
    }

    // 4. Resend — best effort, report status to frontend
    let emailSent = false;
    let emailError: string | null = null;
    log(`Sending results email to ${email}...`, "resend");
    try {
      if (process.env.RESEND_API_KEY) {
        const emailResult = await sendResultsEmail({
          to: email,
          firstName,
          primaryArchetype,
          axisScores,
          ctaRoute,
        });
        emailSent = true;
        log(`Results email sent to ${email}`, "resend");
      } else {
        emailError = "Email service not configured";
        log("Resend API key not set, skipping email", "resend");
      }
    } catch (err: any) {
      emailError = err.message;
      log(`Resend email FAILED for ${email}: ${err.message}`, "resend");
    }

    // 5. Return results
    log(`Returning results for ${email} — emailSent: ${emailSent}`, "quiz");
    return res.status(200).json({
      success: true,
      axisScores,
      primaryArchetype,
      ctaRoute,
      emailSent,
      emailError,
    });
  });

  // Retry sending email (for the retry button on results page)
  app.post("/api/quiz/resend-email", async (req, res) => {
    log(`Received email retry request`, "resend");
    const parsed = resendRetrySchema.safeParse(req.body);
    if (!parsed.success) {
      log(`Retry validation failed: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`, "resend");
      return res.status(400).json({ message: "Invalid request" });
    }

    const { firstName, email, primaryArchetype, axisScores, ctaRoute } = parsed.data;
    log(`Retrying email for ${firstName} <${email}>...`, "resend");

    try {
      if (!process.env.RESEND_API_KEY) {
        log("Resend API key not set", "resend");
        return res.status(503).json({ message: "Email service not configured" });
      }
      const result = await sendResultsEmail({ to: email, firstName, primaryArchetype, axisScores, ctaRoute });
      log(`Retry email sent to ${email}`, "resend");
      return res.status(200).json({ success: true });
    } catch (err: any) {
      log(`Retry email FAILED for ${email}: ${err.message}`, "resend");
      return res.status(502).json({ message: "Failed to send email. Please try again." });
    }
  });

  return httpServer;
}
