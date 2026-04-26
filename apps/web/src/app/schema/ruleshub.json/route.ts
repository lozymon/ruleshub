import { zodToJsonSchema } from "zod-to-json-schema";
import { PackageManifestSchema } from "@ruleshub/types";

const schema = zodToJsonSchema(PackageManifestSchema, {
  name: "PackageManifest",
  $refStrategy: "none",
  definitionPath: "$defs",
});

const body = JSON.stringify(
  {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://ruleshub.dev/schema/ruleshub.json",
    title: "RulesHub Package Manifest",
    description:
      "Schema for ruleshub.json — the manifest file for RulesHub packages",
    ...schema,
  },
  null,
  2,
);

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "application/schema+json",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
