# 004 — UI consistency and blog alignment

- **Status:** ready_for_test
- **Owner:** Codex
- **Created:** 2026-11-22
- **Updated:** 2026-11-22

## Scope

Correct the incomplete Task 003 rollout: remove mixed corner geometry and rebalance the public homepage around one centered content rail.

## Acceptance criteria

- [x] One shared retro corner token governs UI surfaces and controls.
- [x] Homepage sections share one centered horizontal rail.
- [x] Discovery widgets no longer pull the article feed to one side.
- [x] Mobile and desktop layouts retain readable gutters without overflow.

## Dependencies

Existing Task 003 tokens and Astro/Tailwind implementation. No new dependency.

## Security impact

Presentation-only correction; no route, authorization, API or persistence change.

## Assumptions

Retro square uses a subtle shared radius. Discovery content remains useful below the feed.

## Test plan

- Source regression for geometry/alignment.
- `pnpm build`, relevant/full tests and runtime smoke attempt.

## Test report

| Check                         | Status  | Evidence / reason                                                                                                  |
| ----------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| Geometry/alignment regression | PASS    | `node --test test/retro-ui.test.js`; shared token/rail and removal of the old 12-column sidebar are asserted.      |
| Build                         | PASS    | `pnpm build`.                                                                                                      |
| Full suite                    | FAIL    | 12/13 test files passed. Existing access-control fixture expects the currently absent persisted “Chuyên mục” root. |
| Runtime smoke                 | NOT RUN | Astro initialized, but sandbox denied binding `127.0.0.1:4321` with `EPERM`.                                       |

## Blockers

- Browser visual smoke is blocked by sandbox port policy.
- Full green suite requires restoring the expected menu fixture without mutating the user's persisted content.
