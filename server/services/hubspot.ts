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

export async function checkContactExists(email: string): Promise<boolean> {
  const searchResponse = await hubspot.crm.contacts.searchApi.doSearch({
    filterGroups: [{
      filters: [{
        propertyName: "email",
        operator: "EQ",
        value: email,
      }],
    }],
    properties: ["email", "blueprint_archetype"],
    limit: 1,
    after: "0",
    sorts: [],
  });

  // Only consider it a duplicate if they already have a blueprint archetype
  return searchResponse.total > 0 && !!searchResponse.results[0]?.properties?.blueprint_archetype;
}

export async function createHubSpotContact(data: HubSpotContactData) {
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
    return await hubspot.crm.contacts.basicApi.create({
      properties,
      associations: [],
    });
  } catch (err: any) {
    // If contact already exists in HubSpot (from another source), update it instead
    const existingId = err?.body?.message?.match(/Existing ID: (\d+)/)?.[1];
    if (existingId) {
      await hubspot.crm.contacts.basicApi.update(existingId, { properties });
      return { id: existingId };
    }
    throw err;
  }
}
