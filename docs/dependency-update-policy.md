# Dependency Update Policy

## Scope

This policy applies to all package managers used in this repository:
- **npm** — root workspace, `agent/`, `frontend/`
- **Cargo** — `contracts/`

## Update cadence

| Severity | Action | Timeline |
|----------|--------|----------|
| Critical / High CVE | Patch immediately | Within 2 business days of disclosure |
| Moderate CVE | Schedule patch | Within the next sprint (≤ 2 weeks) |
| Low CVE | Batch with routine updates | Monthly |
| No CVE (minor/patch) | Routine upgrade | Monthly |
| Major version bump | Planned upgrade with testing | Quarterly or as needed |

## Process

1. **Detection** — The `npm audit --audit-level=high` gate in CI blocks merges when any high or critical vulnerability is present in `agent/` dependencies. Developers should also run `npm audit` locally before raising a PR.
2. **Assessment** — Confirm whether the vulnerable code path is reachable in this project. Document findings in the PR description if the upgrade is non-trivial.
3. **Upgrade** — Prefer the minimum version that resolves the issue. Update the lock file (`package-lock.json` / `Cargo.lock`) and run the full test suite locally before opening a PR.
4. **Review** — All dependency upgrades require at least one reviewer approval before merging to `main`.
5. **Lock-file commits** — Always commit updated lock files together with `package.json` / `Cargo.toml` changes so CI operates on a reproducible dependency tree.

## Automation

Dependabot is configured (see `.github/dependabot.yml`) to open weekly PRs for outdated dependencies across npm and Cargo workspaces. Maintainers should review and merge these promptly to keep the audit baseline clean.

## Overrides and exceptions

If a vulnerability cannot be patched immediately (e.g., no fix released yet, or the upgrade is a major breaking change), open a tracking issue labelled `security` and document the accepted risk, the mitigating controls in place, and the expected resolution date.
