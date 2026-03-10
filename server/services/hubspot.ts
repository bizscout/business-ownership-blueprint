import { Client } from "@hubspot/api-client";

const hubspot = new Client({
  accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
});

export interface HubSpotContactData {
  email: string;
  firstName: string;
  ownsBusiness: boolean;
  revenueRange: string | null;
  axisScores: { DI: number; OD: number; CR: number; RT: number; SV: number };
  primaryArchetype: string;
  ctaRoute: string;
}

export async function upsertHubSpotContact(data: HubSpotContactData) {
  const properties: Record<string, string> = {
    email: data.email,
    firstname: data.firstName,
    owns_business: String(data.ownsBusiness),
    estimated_annual_revenue: data.revenueRange ?? "",
    blueprint_archetype: data.primaryArchetype,
    score_deal_instinct: data.axisScores.DI.toFixed(1),
    score_operator_depth: data.axisScores.OD.toFixed(1),
    score_capital_readiness: data.axisScores.CR.toFixed(1),
    score_risk_tolerance: data.axisScores.RT.toFixed(1),
    score_strategic_vision: data.axisScores.SV.toFixed(1),
    blueprint_cta_route: data.ctaRoute,
    blueprint_completed_at: new Date().toISOString(),
  };

  try {
    // Try to create the contact first
    const response = await hubspot.crm.contacts.basicApi.create({
      properties,
      associations: [],
    });
    return response;
  } catch (err: any) {
    // If contact already exists (409 conflict), update by email
    if (err?.code === 409 || err?.statusCode === 409 || err?.body?.category === "CONFLICT") {
      const response = await hubspot.crm.contacts.basicApi.update(
        data.email,
        { properties },
        undefined,
        undefined,
        "email"
      );
      return response;
    }
    throw err;
  }
}
