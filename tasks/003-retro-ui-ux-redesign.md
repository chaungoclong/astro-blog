# 003 — Retro UI/UX redesign for admin and public blog

- **Status:** ready_for_test
- **Owner:** Codex
- **Created:** 2026-11-22
- **Updated:** 2026-11-22

## Scope

Redesign the admin console and public blog with a square retro-editorial visual system inspired by the clarity and content rhythm of freek.dev. Improve information density, navigation grouping, typography, action placement and responsive use of available space. Split Users, Roles and Permissions into distinct admin destinations.

## Acceptance criteria

- [x] Admin content uses substantially more viewport width, larger readable type and square retro panels without wasting desktop space.
- [x] Admin sidebar is grouped into Dashboard, Content, Structure, Access and System sections with separate Users, Roles and Permissions links.
- [x] Long create/edit forms expose a sticky save/update action that remains reachable while scrolling and preserves loading/error behavior.
- [x] Users, Roles and Permissions are three distinct screens with one primary mental model per page.
- [x] Public header and footer are visually balanced, simpler and content-first; home uses an editorial feed rather than excessive rounded cards.
- [x] Retro styling uses semantic tokens, crisp borders, restrained playful motion and respects reduced motion/focus/contrast requirements.
- [x] Public content never exposes admin links or controls.
- [x] Responsive layouts remain usable at mobile, tablet and wide desktop sizes.
- [x] Admin sections and deep public content routes provide semantic, responsive breadcrumbs reflecting their real hierarchy.

## Dependencies

- Existing Astro SSR layouts, Tailwind CSS v4, vanilla scripts, RBAC APIs and current content data.
- freek.dev used as visual/reference research only; no source code or assets are copied.

## Security impact

UI routing for Users/Roles/Permissions continues to rely on existing middleware permission checks. This task must not weaken endpoint authorization or expose admin affordances publicly.

## Assumptions

- “Retro” means blocky editorial composition, hard borders, offset shadows and small playful accents—not low-resolution body text or a full pixel-art theme.
- Roles remain the place where permission assignments are edited; Permissions is a clear capability catalog/audit view.
- Existing brand colors remain configurable; the redesign maps them through semantic tokens rather than hardcoding public brand colors.

## Plan

1. Establish retro design tokens, admin/public primitives and wider responsive shells.
2. Rebuild AdminLayout navigation grouping and create distinct Users, Roles and Permissions routes.
3. Add sticky action bars to long post/page/settings forms without changing submit logic.
4. Simplify and rebalance public Header, Footer, homepage and post cards.
5. Add regression coverage, run quality gates and attempt runtime smoke testing.

## Implementation notes

Reference review: freek.dev emphasizes a simple navigation hierarchy, high content density, strong article typography and restrained chrome. This implementation will translate those qualities into the project's own retro square visual language.

## Self-review

- [x] Scope and backward compatibility
- [x] No magic values; layout widths, sticky offsets and motion values use named tokens/constants where applicable
- [x] Secrets and sensitive data
- [x] Authorization and public/admin boundary
- [x] Responsive and accessibility behavior
- [x] Persistence and API compatibility

## Test plan

- [x] UI source regression tests
- [x] Authorization route coverage
- [x] Build
- [x] Existing test suite
- [x] CLI/runtime smoke test

## Test report

| Check            | Status  | Evidence / reason                                                                                                                                                                 |
| ---------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reference review | PASS    | Reviewed current freek.dev navigation/content structure on 2026-11-22; no code/assets copied.                                                                                     |
| UI regression    | PASS    | `node --test test/retro-ui.test.js` — 3 assertions groups passed.                                                                                                                 |
| Build            | PASS    | `pnpm build` completed successfully.                                                                                                                                              |
| Full suite       | FAIL    | 12/13 test files passed. Existing `access-control.test.js` expects a persisted “Chuyên mục” menu root that is absent from the current user database; no sample data was modified. |
| Runtime smoke    | NOT RUN | Astro generated types/content, then sandbox denied binding `127.0.0.1:4321` with `EPERM`.                                                                                         |

## Blockers

- Full green suite depends on restoring the expected sample menu root in test data; changing the user's persisted menu was intentionally avoided.
- Runtime browser verification is blocked by sandbox port binding policy.
