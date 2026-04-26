import path from "path";

// Maps slug → absolute path to the MDX file.
// Paths are resolved at module load time so they survive bundling.
const docsRoot = path.join(process.cwd(), "src/docs");

export const contentMap: Record<string, string> = {
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
  "publishing/your-first-package": path.join(
    docsRoot,
    "publishing/your-first-package.mdx",
  ),
  "publishing/manifest-reference": path.join(
    docsRoot,
    "publishing/manifest-reference.mdx",
  ),
  "cli/overview": path.join(docsRoot, "cli/overview.mdx"),
};
