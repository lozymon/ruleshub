import { OwnerType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Tool =
  | "claude-code"
  | "cursor"
  | "copilot"
  | "windsurf"
  | "cline"
  | "aider"
  | "continue";

type AssetType =
  | "rule"
  | "command"
  | "workflow"
  | "agent"
  | "mcp-server"
  | "pack"
  | "skill";

type SeedUser = {
  githubId: string;
  username: string;
  avatarUrl: string;
  bio: string;
  verified?: boolean;
};

type SeedOrg = {
  slug: string;
  displayName: string;
  avatarUrl: string;
  verified?: boolean;
  members: Array<{ username: string; role: "owner" | "admin" | "member" }>;
};

type SeedPackage = {
  namespace: string;
  name: string;
  ownerUsername?: string;
  ownerOrgSlug?: string;
  type: AssetType;
  description: string;
  tags: string[];
  projectTypes: string[];
  tools: Tool[];
  downloads: number;
  qualityScore: number;
  versions: Array<{ version: string; changelog?: string }>;
  includes?: string[];
  repository?: { url: string; directory?: string; branch?: string };
};

const USERS: SeedUser[] = [
  {
    githubId: "seed-alice",
    username: "alice",
    avatarUrl: "https://avatars.githubusercontent.com/u/10001?v=4",
    bio: "Tooling enthusiast — Claude Code workflows and refactor playbooks.",
    verified: true,
  },
  {
    githubId: "seed-bob",
    username: "bob",
    avatarUrl: "https://avatars.githubusercontent.com/u/10002?v=4",
    bio: "Frontend dev. Cursor + Copilot rules for React and Tailwind.",
  },
  {
    githubId: "seed-carol",
    username: "carol",
    avatarUrl: "https://avatars.githubusercontent.com/u/10003?v=4",
    bio: "Platform engineer. MCP servers and security agents.",
    verified: true,
  },
];

const ORGS: SeedOrg[] = [
  {
    slug: "vercel",
    displayName: "Vercel",
    avatarUrl: "https://avatars.githubusercontent.com/u/14985020?v=4",
    verified: true,
    members: [{ username: "carol", role: "owner" }],
  },
];

const FILE_FOR: Record<Tool, string> = {
  "claude-code": "CLAUDE.md",
  cursor: ".cursorrules",
  copilot: ".github/copilot-instructions.md",
  windsurf: ".windsurfrules",
  cline: ".clinerules",
  aider: "CONVENTIONS.md",
  continue: ".continue/config.json",
};

const PACKAGES: SeedPackage[] = [
  {
    namespace: "alice",
    name: "nextjs-rules",
    ownerUsername: "alice",
    type: "rule",
    description: "Opinionated Next.js 15 App Router conventions and patterns.",
    tags: ["nextjs", "react", "app-router"],
    projectTypes: ["web", "fullstack"],
    tools: ["claude-code", "cursor"],
    downloads: 1234,
    qualityScore: 88,
    versions: [
      { version: "0.1.0", changelog: "Initial release." },
      { version: "0.2.0", changelog: "Add server-component guidance." },
      { version: "1.0.0", changelog: "Stable release." },
    ],
    repository: { url: "https://github.com/alice/nextjs-rules" },
  },
  {
    namespace: "alice",
    name: "typescript-strict",
    ownerUsername: "alice",
    type: "rule",
    description:
      "Strict TypeScript conventions — no `any`, branded types, exhaustive switches.",
    tags: ["typescript", "strict"],
    projectTypes: ["library", "web", "backend"],
    tools: ["claude-code", "cursor", "copilot"],
    downloads: 892,
    qualityScore: 92,
    versions: [
      { version: "1.0.0" },
      { version: "1.1.0", changelog: "Add `satisfies` patterns." },
    ],
  },
  {
    namespace: "alice",
    name: "tdd-workflow",
    ownerUsername: "alice",
    type: "workflow",
    description: "Red-green-refactor playbook for test-first development.",
    tags: ["tdd", "testing"],
    projectTypes: ["backend", "library"],
    tools: ["claude-code"],
    downloads: 410,
    qualityScore: 75,
    versions: [{ version: "0.3.0" }],
  },
  {
    namespace: "alice",
    name: "refactor",
    ownerUsername: "alice",
    type: "command",
    description: "Slash command that proposes refactors for the selected code.",
    tags: ["refactor", "command"],
    projectTypes: ["any"],
    tools: ["claude-code"],
    downloads: 233,
    qualityScore: 70,
    versions: [{ version: "0.1.0" }],
    repository: {
      url: "https://github.com/alice/airules",
      directory: "commands/refactor",
    },
  },
  {
    namespace: "alice",
    name: "code-review",
    ownerUsername: "alice",
    type: "skill",
    description: "Reviews a diff against project rules and flags violations.",
    tags: ["review", "skill"],
    projectTypes: ["any"],
    tools: ["claude-code"],
    downloads: 651,
    qualityScore: 81,
    versions: [{ version: "0.2.0" }, { version: "0.3.0" }],
    repository: {
      url: "https://github.com/alice/airules",
      directory: "skills/code-review",
      branch: "main",
    },
  },
  {
    namespace: "bob",
    name: "react-best-practices",
    ownerUsername: "bob",
    type: "rule",
    description: "Modern React patterns — hooks, suspense, error boundaries.",
    tags: ["react", "hooks"],
    projectTypes: ["web"],
    tools: ["cursor", "copilot", "windsurf"],
    downloads: 1502,
    qualityScore: 85,
    versions: [{ version: "1.0.0" }, { version: "1.2.0" }],
  },
  {
    namespace: "bob",
    name: "tailwind-rules",
    ownerUsername: "bob",
    type: "rule",
    description: "Tailwind utility-first conventions with shadcn/ui.",
    tags: ["tailwind", "css", "shadcn"],
    projectTypes: ["web"],
    tools: ["cursor"],
    downloads: 380,
    qualityScore: 72,
    versions: [{ version: "0.5.0" }],
  },
  {
    namespace: "bob",
    name: "python-conventions",
    ownerUsername: "bob",
    type: "rule",
    description: "PEP 8 + type hints + ruff conventions for Python projects.",
    tags: ["python", "ruff"],
    projectTypes: ["backend", "data"],
    tools: ["cursor", "aider", "continue"],
    downloads: 727,
    qualityScore: 78,
    versions: [{ version: "1.0.0" }],
  },
  {
    namespace: "bob",
    name: "git-workflow",
    ownerUsername: "bob",
    type: "workflow",
    description: "Conventional commits, PR templates, and branch naming.",
    tags: ["git", "workflow"],
    projectTypes: ["any"],
    tools: ["claude-code", "cline"],
    downloads: 209,
    qualityScore: 66,
    versions: [{ version: "0.1.0" }],
  },
  {
    namespace: "carol",
    name: "postgres-mcp",
    ownerUsername: "carol",
    type: "mcp-server",
    description: "MCP server exposing read-only Postgres introspection.",
    tags: ["mcp", "postgres", "database"],
    projectTypes: ["backend"],
    tools: ["claude-code"],
    downloads: 845,
    qualityScore: 84,
    versions: [{ version: "0.4.0" }, { version: "0.5.0" }],
  },
  {
    namespace: "carol",
    name: "github-mcp",
    ownerUsername: "carol",
    type: "mcp-server",
    description: "MCP server for GitHub issues, PRs, and code search.",
    tags: ["mcp", "github"],
    projectTypes: ["any"],
    tools: ["claude-code", "cursor"],
    downloads: 1320,
    qualityScore: 90,
    versions: [{ version: "1.0.0" }, { version: "1.1.0" }],
    repository: { url: "https://github.com/carol/github-mcp" },
  },
  {
    namespace: "carol",
    name: "security-agent",
    ownerUsername: "carol",
    type: "agent",
    description: "Audits code for OWASP top 10 vulnerabilities.",
    tags: ["security", "agent", "owasp"],
    projectTypes: ["web", "backend"],
    tools: ["claude-code"],
    downloads: 312,
    qualityScore: 79,
    versions: [{ version: "0.2.0" }],
  },
  {
    namespace: "vercel",
    name: "nextjs-full-stack",
    ownerOrgSlug: "vercel",
    type: "pack",
    description: "Curated bundle: Next.js rules, TS strict, deploy agent.",
    tags: ["nextjs", "pack", "fullstack"],
    projectTypes: ["fullstack"],
    tools: ["claude-code", "cursor"],
    downloads: 2104,
    qualityScore: 94,
    versions: [{ version: "1.0.0" }, { version: "1.1.0" }],
    includes: ["alice/nextjs-rules@^1.0.0", "alice/typescript-strict@^1.0.0"],
  },
  {
    namespace: "vercel",
    name: "turbo-rules",
    ownerOrgSlug: "vercel",
    type: "rule",
    description: "Monorepo conventions for Turborepo + pnpm workspaces.",
    tags: ["turborepo", "monorepo", "pnpm"],
    projectTypes: ["fullstack", "library"],
    tools: ["claude-code", "cursor", "windsurf"],
    downloads: 1788,
    qualityScore: 89,
    versions: [{ version: "0.9.0" }, { version: "1.0.0" }],
    repository: {
      url: "https://github.com/vercel/turbo",
      directory: "packages/turbo-rules",
    },
  },
  {
    namespace: "vercel",
    name: "deploy-agent",
    ownerOrgSlug: "vercel",
    type: "agent",
    description: "Agent that prepares a PR for production deploy.",
    tags: ["deploy", "agent"],
    projectTypes: ["fullstack"],
    tools: ["claude-code", "cursor"],
    downloads: 467,
    qualityScore: 76,
    versions: [{ version: "0.1.0" }],
  },
];

function buildManifest(p: SeedPackage, version: string) {
  const base = {
    name: `${p.namespace}/${p.name}`,
    version,
    type: p.type,
    description: p.description,
    tags: p.tags,
    projectTypes: p.projectTypes,
    license: "MIT",
    ...(p.repository ? { repository: p.repository } : {}),
  };
  if (p.type === "pack") {
    return { ...base, includes: p.includes ?? [] };
  }
  const targets: Record<string, { file: string }> = {};
  for (const t of p.tools) targets[t] = { file: FILE_FOR[t] };
  return { ...base, targets };
}

async function main() {
  // ── Users ────────────────────────────────────────────────────────
  const userByName = new Map<string, string>();
  for (const u of USERS) {
    const row = await prisma.user.upsert({
      where: { githubId: u.githubId },
      update: {
        username: u.username,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        verified: u.verified ?? false,
      },
      create: {
        githubId: u.githubId,
        username: u.username,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        verified: u.verified ?? false,
      },
    });
    userByName.set(u.username, row.id);
  }

  // ── Organisations + members ──────────────────────────────────────
  const orgBySlug = new Map<string, string>();
  for (const o of ORGS) {
    const row = await prisma.organisation.upsert({
      where: { slug: o.slug },
      update: {
        displayName: o.displayName,
        avatarUrl: o.avatarUrl,
        verified: o.verified ?? false,
      },
      create: {
        slug: o.slug,
        displayName: o.displayName,
        avatarUrl: o.avatarUrl,
        verified: o.verified ?? false,
      },
    });
    orgBySlug.set(o.slug, row.id);
    for (const m of o.members) {
      const userId = userByName.get(m.username);
      if (!userId) continue;
      await prisma.orgMember.upsert({
        where: { orgId_userId: { orgId: row.id, userId } },
        update: { role: m.role },
        create: { orgId: row.id, userId, role: m.role },
      });
    }
  }

  // ── Packages + versions ──────────────────────────────────────────
  const pkgByKey = new Map<string, string>();
  for (const p of PACKAGES) {
    const ownerType: OwnerType = p.ownerOrgSlug
      ? OwnerType.org
      : OwnerType.user;
    const ownerUserId = p.ownerUsername
      ? userByName.get(p.ownerUsername)
      : undefined;
    const ownerOrgId = p.ownerOrgSlug
      ? orgBySlug.get(p.ownerOrgSlug)
      : undefined;

    const repoFields = {
      repoUrl: p.repository?.url ?? null,
      repoDirectory: p.repository?.directory ?? null,
      repoBranch: p.repository?.branch ?? null,
    };

    const pkg = await prisma.package.upsert({
      where: { namespace_name: { namespace: p.namespace, name: p.name } },
      update: {
        type: p.type,
        description: p.description,
        tags: p.tags,
        projectTypes: p.projectTypes,
        supportedTools: p.tools,
        totalDownloads: p.downloads,
        qualityScore: p.qualityScore,
        hasReadme: true,
        ownerType,
        ownerUserId: ownerUserId ?? null,
        ownerOrgId: ownerOrgId ?? null,
        ...repoFields,
      },
      create: {
        namespace: p.namespace,
        name: p.name,
        type: p.type,
        description: p.description,
        tags: p.tags,
        projectTypes: p.projectTypes,
        supportedTools: p.tools,
        totalDownloads: p.downloads,
        qualityScore: p.qualityScore,
        hasReadme: true,
        ownerType,
        ownerUserId: ownerUserId ?? null,
        ownerOrgId: ownerOrgId ?? null,
        ...repoFields,
      },
    });
    pkgByKey.set(`${p.namespace}/${p.name}`, pkg.id);

    for (const v of p.versions) {
      await prisma.packageVersion.upsert({
        where: { packageId_version: { packageId: pkg.id, version: v.version } },
        update: {
          manifestJson: buildManifest(p, v.version),
          changelog: v.changelog,
        },
        create: {
          packageId: pkg.id,
          version: v.version,
          manifestJson: buildManifest(p, v.version),
          storageKey: `seed/${p.namespace}/${p.name}/${v.version}.zip`,
          sha256: null,
          changelog: v.changelog,
          downloads: Math.floor(p.downloads / p.versions.length),
        },
      });
    }
  }

  // ── Stars (each seed user stars several packages) ────────────────
  const starPlan: Array<{ username: string; pkg: string }> = [
    { username: "alice", pkg: "carol/github-mcp" },
    { username: "alice", pkg: "vercel/nextjs-full-stack" },
    { username: "alice", pkg: "vercel/turbo-rules" },
    { username: "bob", pkg: "alice/nextjs-rules" },
    { username: "bob", pkg: "alice/typescript-strict" },
    { username: "bob", pkg: "vercel/nextjs-full-stack" },
    { username: "bob", pkg: "carol/github-mcp" },
    { username: "carol", pkg: "alice/nextjs-rules" },
    { username: "carol", pkg: "bob/react-best-practices" },
    { username: "carol", pkg: "vercel/turbo-rules" },
  ];
  for (const s of starPlan) {
    const userId = userByName.get(s.username);
    const packageId = pkgByKey.get(s.pkg);
    if (!userId || !packageId) continue;
    await prisma.star.upsert({
      where: { userId_packageId: { userId, packageId } },
      update: {},
      create: { userId, packageId },
    });
  }

  // Sync denormalized star counts with actual Star rows.
  for (const [, packageId] of pkgByKey) {
    const count = await prisma.star.count({ where: { packageId } });
    await prisma.package.update({
      where: { id: packageId },
      data: { stars: count },
    });
  }

  // ── A public collection by alice ─────────────────────────────────
  const aliceId = userByName.get("alice");
  if (aliceId) {
    const col = await prisma.collection.upsert({
      where: { userId_slug: { userId: aliceId, slug: "starter-kit" } },
      update: {
        title: "AI dev starter kit",
        description: "What I install on every new repo.",
      },
      create: {
        userId: aliceId,
        slug: "starter-kit",
        title: "AI dev starter kit",
        description: "What I install on every new repo.",
      },
    });
    const collectionPkgs = [
      "alice/nextjs-rules",
      "alice/typescript-strict",
      "bob/react-best-practices",
      "carol/github-mcp",
      "vercel/turbo-rules",
    ];
    for (const key of collectionPkgs) {
      const packageId = pkgByKey.get(key);
      if (!packageId) continue;
      await prisma.collectionItem.upsert({
        where: { collectionId_packageId: { collectionId: col.id, packageId } },
        update: {},
        create: { collectionId: col.id, packageId },
      });
    }
  }

  const totals = await Promise.all([
    prisma.user.count(),
    prisma.organisation.count(),
    prisma.package.count(),
    prisma.packageVersion.count(),
    prisma.star.count(),
  ]);
  console.log(
    `Seed complete — users:${totals[0]} orgs:${totals[1]} packages:${totals[2]} versions:${totals[3]} stars:${totals[4]}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
