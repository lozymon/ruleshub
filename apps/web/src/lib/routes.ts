export const routes = {
  home: "/",
  browse: "/browse",
  package: (name: string) => `/packages/${name}`,
  packageVersion: (name: string, version: string) =>
    `/packages/${name}/${version}`,
  packageFork: (name: string) => `/packages/${name}/fork`,
  packageDiff: (name: string, from: string, to: string) =>
    `/packages/${name}/diff?from=${from}&to=${to}`,
  user: (username: string) => `/users/${username}`,
  org: (orgname: string) => `/orgs/${orgname}`,
  publish: "/publish",
  import: "/import",
  dashboard: "/dashboard",
  dashboardOrg: (orgname: string) => `/dashboard/org/${orgname}`,
  dashboardAnalytics: "/dashboard/analytics",
  dashboardAdmin: "/dashboard/admin",
  login: "/login",
  tools: "/tools",
  tool: (tool: string) => `/tools/${tool}`,
  collections: "/collections",
  collection: (username: string, slug: string) =>
    `/collections/${username}/${slug}`,
  leaderboard: "/leaderboard",
  comingSoon: "/coming-soon",
} as const;
