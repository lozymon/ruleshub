# /bug-fix

Fix a bug. Scope is tight — only touch what's broken.

## Checklist

1. **Reproduce** — confirm the bug exists and understand the exact failure condition before touching any code
2. **Identify root cause** — read the relevant code; trace the actual cause, not a symptom
3. **Fix only the root cause** — do not refactor surrounding code, do not clean up unrelated things
4. **Verify the fix** — reproduce the original failure condition and confirm it no longer occurs
5. **Check for regressions** — run the relevant test suite; check related code paths that could be affected

## Rules
- One fix per PR — if you spot other bugs, note them but do not fix them here
- No opportunistic refactors
- If the root cause turns out to require a larger change, stop and discuss before proceeding
