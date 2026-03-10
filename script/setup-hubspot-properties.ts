/**
 * One-time script to create custom contact properties in HubSpot.
 * Run: npx tsx script/setup-hubspot-properties.ts
 *
 * Safe to re-run — skips properties that already exist.
 */

import { Client } from "@hubspot/api-client";
const hubspot = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

const properties = [
  {
    name: "owns_business",
    label: "Owns Business",
    type: "enumeration",
    fieldType: "select",
    groupName: "contactinformation",
    options: [
      { label: "Yes", value: "true", displayOrder: 0 },
      { label: "No", value: "false", displayOrder: 1 },
    ],
  },
  {
    name: "estimated_annual_revenue",
    label: "Estimated Annual Revenue",
    type: "enumeration",
    fieldType: "select",
    groupName: "contactinformation",
    options: [
      { label: "$0 - $250k", value: "0-250k", displayOrder: 0 },
      { label: "$250k - $1M", value: "250k-1m", displayOrder: 1 },
      { label: "$1M - $5M", value: "1m-5m", displayOrder: 2 },
      { label: "$5M+", value: "5m+", displayOrder: 3 },
    ],
  },
  {
    name: "blueprint_archetype",
    label: "Blueprint Archetype",
    type: "enumeration",
    fieldType: "select",
    groupName: "contactinformation",
    options: [
      { label: "Acquirer", value: "Acquirer", displayOrder: 0 },
      { label: "Operator", value: "Operator", displayOrder: 1 },
      { label: "Builder", value: "Builder", displayOrder: 2 },
      { label: "Architect", value: "Architect", displayOrder: 3 },
    ],
  },
  {
    name: "score_deal_instinct",
    label: "Score - Deal Instinct",
    type: "number",
    fieldType: "number",
    groupName: "contactinformation",
  },
  {
    name: "score_operator_depth",
    label: "Score - Operator Depth",
    type: "number",
    fieldType: "number",
    groupName: "contactinformation",
  },
  {
    name: "score_capital_readiness",
    label: "Score - Capital Readiness",
    type: "number",
    fieldType: "number",
    groupName: "contactinformation",
  },
  {
    name: "score_risk_tolerance",
    label: "Score - Risk Tolerance",
    type: "number",
    fieldType: "number",
    groupName: "contactinformation",
  },
  {
    name: "score_strategic_vision",
    label: "Score - Strategic Vision",
    type: "number",
    fieldType: "number",
    groupName: "contactinformation",
  },
  {
    name: "blueprint_cta_route",
    label: "Blueprint CTA Route",
    type: "enumeration",
    fieldType: "select",
    groupName: "contactinformation",
    options: [
      { label: "Academy", value: "academy", displayOrder: 0 },
      { label: "BoardRoom", value: "boardroom", displayOrder: 1 },
    ],
  },
  {
    name: "blueprint_completed_at",
    label: "Blueprint Completed At",
    type: "datetime",
    fieldType: "date",
    groupName: "contactinformation",
  },
];

async function main() {
  console.log("Creating HubSpot custom contact properties...\n");

  for (const prop of properties) {
    try {
      await hubspot.crm.properties.coreApi.create("contacts", prop as any);
      console.log(`  ✓ Created: ${prop.name}`);
    } catch (err: any) {
      if (err?.code === 409 || err?.body?.category === "CONFLICT") {
        console.log(`  - Exists:  ${prop.name}`);
      } else {
        console.error(`  ✗ Failed:  ${prop.name}`, err?.body?.message || err.message);
      }
    }
  }

  console.log("\nDone.");
}

main();
