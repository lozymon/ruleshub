export interface DocPage {
  title: string;
  slug: string;
}

export interface DocSection {
  title: string;
  pages: DocPage[];
}

export const docNav: DocSection[] = [
  {
    title: "Getting Started",
    pages: [
      { title: "Introduction", slug: "getting-started/introduction" },
      { title: "Quick Start", slug: "getting-started/quick-start" },
      { title: "Concepts", slug: "getting-started/concepts" },
    ],
  },
  {
    title: "Publishing",
    pages: [
      { title: "Your First Package", slug: "publishing/your-first-package" },
      { title: "Manifest Reference", slug: "publishing/manifest-reference" },
      { title: "Tool Targets", slug: "publishing/targets" },
      { title: "Packs", slug: "publishing/packs" },
      { title: "Versioning", slug: "publishing/versioning" },
    ],
  },
  {
    title: "CLI",
    pages: [
      { title: "Overview", slug: "cli/overview" },
      { title: "install", slug: "cli/install" },
      { title: "publish", slug: "cli/publish" },
      { title: "validate", slug: "cli/validate" },
      { title: "outdated & update", slug: "cli/outdated" },
    ],
  },
  {
    title: "API",
    pages: [
      { title: "Overview", slug: "api/overview" },
      { title: "Packages", slug: "api/packages" },
      { title: "Authentication", slug: "api/auth" },
    ],
  },
  {
    title: "Contributing",
    pages: [
      { title: "Development Setup", slug: "contributing/development" },
      { title: "Adding a Tool", slug: "contributing/adding-a-tool" },
      { title: "Architecture", slug: "contributing/architecture" },
    ],
  },
];

export function flatPages(): DocPage[] {
  return docNav.flatMap((s) => s.pages);
}
