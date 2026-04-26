# /release

Release a new version of the `@ruleshub/cli` package to npm.

## Steps

1. **Confirm the branch** — must be on `main` with a clean working tree (`git status`)
2. **Determine the version bump** — ask if not specified: `patch`, `minor`, or `major`
3. **Run tests and typecheck:**
   ```
   pnpm --filter cli typecheck
   pnpm --filter cli test
   ```
   Stop if either fails.
4. **Bump the version** — edit `packages/cli/package.json` version field manually (no `npm version` — it creates an unreviewed commit)
5. **Build:**
   ```
   pnpm --filter cli build
   ```
6. **Commit the version bump:**
   ```
   chore(cli): release vX.Y.Z
   ```
7. **Tag:**
   ```
   git tag cli-vX.Y.Z
   ```
8. **Stop here** — print the publish command for the user to run manually:
   ```
   pnpm --filter cli publish --access public
   ```
   Publishing to npm is a one-way action — always hand off to the user.

## Rules

- Never push or publish automatically — always stop at step 8
- Never skip tests
- The tag format is `cli-vX.Y.Z`, not just `vX.Y.Z` (monorepo — other packages will have their own tags)
