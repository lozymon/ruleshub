import * as fs from "fs";
import * as path from "path";
import type { AssetType, SupportedTool } from "@ruleshub/types";
import {
  targetPath,
  targetFileContent,
  readmeContent,
  packReadmeContent,
} from "./templates";

export interface ScaffoldOptions {
  name: string;
  type: AssetType;
  description: string;
  tools: SupportedTool[];
  license: string;
  tags: string[];
  outDir: string;
  force: boolean;
}

export function scaffold(opts: ScaffoldOptions): string[] {
  const { name, type, description, tools, license, tags, outDir, force } = opts;
  const packageSlug = name.split("/")[1] ?? name;
  const packageDir = path.join(outDir, packageSlug);

  if (fs.existsSync(packageDir)) {
    if (!force) {
      throw new Error(
        `Directory "${packageSlug}" already exists. Use --force to overwrite.`,
      );
    }
  } else {
    fs.mkdirSync(packageDir, { recursive: true });
  }

  const written: string[] = [];

  function write(relPath: string, content: string) {
    const abs = path.join(packageDir, relPath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf-8");
    written.push(relPath);
  }

  // ruleshub.json
  if (type === "pack") {
    write(
      "ruleshub.json",
      JSON.stringify(
        {
          $schema: "https://ruleshub.dev/schema/ruleshub.json",
          name,
          version: "1.0.0",
          type,
          description,
          tags,
          projectTypes: [],
          license,
          includes: [],
        },
        null,
        2,
      ) + "\n",
    );
    write("README.md", packReadmeContent(name, description));
  } else {
    const targets: Record<string, { file: string }> = {};
    for (const tool of tools) {
      targets[tool] = { file: targetPath(type, tool) };
    }

    write(
      "ruleshub.json",
      JSON.stringify(
        {
          $schema: "https://ruleshub.dev/schema/ruleshub.json",
          name,
          version: "1.0.0",
          type,
          description,
          tags,
          projectTypes: [],
          license,
          targets,
        },
        null,
        2,
      ) + "\n",
    );

    for (const tool of tools) {
      const filePath = targetPath(type, tool);
      write(filePath, targetFileContent(type, tool, name));
    }

    write("README.md", readmeContent(name, type, description, tools));
  }

  return written;
}
