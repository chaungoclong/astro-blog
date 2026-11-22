# 006 — Compact users and category CRUD policy

- **Status:** ready_for_test
- **Owner:** Codex
- **Created:** 2026-11-22
- **Updated:** 2026-11-22

## Scope

Reduce excessive density/size in the user creation form and complete category edit/delete behavior with a server-side no-delete-while-used policy.

## Acceptance criteria

- [x] User creation controls use compact admin density without reducing labels, validation or touch accessibility.
- [x] Categories can be edited, including name, slug, description and parent.
- [x] Renaming a category preserves post assignments.
- [x] Category deletion is rejected server-side when any published or draft post uses it.
- [x] UI explains the policy and disables/rejects deletion consistently.

## Dependencies

Existing SQLite category/post schema, RBAC middleware and vanilla admin UI.

## Security impact

Category writes remain protected by authentication and `categories.manage`; policy enforcement lives in `dbService`/API, not only the browser.

## Test plan

- Unit test category rename/delete policy, UI source regression, build, full suite and runtime smoke.

## Test report

| Check | Status | Evidence / reason |
| --- | --- | --- |
| Category policy/unit | PASS | `node --test test/db.test.js`; draft usage blocks delete and rename preserves post assignment; test records cleaned in `finally`. |
| UI regression | PASS | `node --test test/retro-ui.test.js`; compact form and policy-aware edit/delete controls asserted. |
| Build | PASS | `pnpm build`. |
| Full suite | FAIL | 12/13 test files passed. Existing access-control fixture still expects an absent persisted “Chuyên mục” menu root. |
| Runtime smoke | NOT RUN | Astro initialized; sandbox denied binding `127.0.0.1:4321` with `EPERM`. |

## Blockers

- Full suite remains blocked by the pre-existing persisted menu fixture mismatch.
- Browser smoke remains blocked by sandbox port policy.
