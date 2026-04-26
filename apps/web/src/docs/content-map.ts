import path from "path";

// Maps slug → absolute path to the MDX file.
// Paths are resolved at module load time so they survive bundling.
const docsRoot = path.join(process.cwd(), "src/docs");

export const contentMap: Record<string, string> = {
  // Getting Started
  "getting-started/introduction": path.join(
    docsRoot,
    "getting-started/introduction.mdx",
  ),
  "getting-started/quick-start": path.join(
    docsRoot,
    "getting-started/quick-start.mdx",
  ),
  "getting-started/concepts": path.join(
    docsRoot,
    "getting-started/concepts.mdx",
  ),

  // Publishing
  "publishing/your-first-package": path.join(
    docsRoot,
    "publishing/your-first-package.mdx",
  ),
  "publishing/manifest-reference": path.join(
    docsRoot,
    "publishing/manifest-reference.mdx",
  ),
  "publishing/targets": path.join(docsRoot, "publishing/targets.mdx"),
  "publishing/packs": path.join(docsRoot, "publishing/packs.mdx"),
  "publishing/versioning": path.join(docsRoot, "publishing/versioning.mdx"),

  // CLI
  "cli/overview": path.join(docsRoot, "cli/overview.mdx"),
  "cli/install": path.join(docsRoot, "cli/install.mdx"),
  "cli/publish": path.join(docsRoot, "cli/publish.mdx"),
  "cli/validate": path.join(docsRoot, "cli/validate.mdx"),
  "cli/outdated": path.join(docsRoot, "cli/outdated.mdx"),

  // API
  "api/overview": path.join(docsRoot, "api/overview.mdx"),
  "api/packages": path.join(docsRoot, "api/packages.mdx"),
  "api/auth": path.join(docsRoot, "api/auth.mdx"),

  // Contributing
  "contributing/development": path.join(
    docsRoot,
    "contributing/development.mdx",
  ),
  "contributing/adding-a-tool": path.join(
    docsRoot,
    "contributing/adding-a-tool.mdx",
  ),
  "contributing/architecture": path.join(
    docsRoot,
    "contributing/architecture.mdx",
  ),
};
