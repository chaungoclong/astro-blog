# 002 — Hierarchical taxonomy, menu builder and permission RBAC

- **Status:** ready_for_test
- **Owner:** Codex
- **Created:** 2026-11-22
- **Updated:** 2026-11-22

## Scope

Add nested categories, an ordered drag-and-drop public menu builder, user management, and permission-based RBAC modeled after Laravel Permission's user → role → permission inheritance.

## Acceptance criteria

- [x] Categories support safe parent/child nesting without cycles.
- [x] Admin can create and reorder menu items, including nesting, with keyboard-accessible move controls.
- [x] Public header renders the configured visible menu; legacy navigation remains until the first managed item exists.
- [x] Admin can create/delete users, assign multiple roles, create roles, and synchronize role permissions.
- [x] Authorization checks permissions at protected page/API boundaries; UI visibility is not the security boundary.
- [x] Existing administrator credentials migrate without losing access.
- [x] Success, failure, validation, loading, empty, and destructive states are clear.
- [x] Menu source library always exposes recoverable system links for Home (`/`) and About (`/about`), even after their menu items are deleted.
- [x] Menu tree is rendered in true depth-first order with clear hierarchy; parent controls exclude self and every descendant.
- [x] Service/API reject missing parents, self-parent and ancestor cycles, including corrupted cyclic ancestor chains without infinite traversal.
- [x] Deleting a menu branch removes descendants deliberately and mutation endpoints verify authentication in addition to middleware permission checks.

## Dependencies

- Existing SQLite database, session cookie authentication, Astro middleware, admin layout and toast system.

## Security impact

High. Authorization becomes user-specific. Passwords remain scrypt hashes; user/role/menu/category inputs use prepared statements and server validation. The final super-admin cannot be locked out or deleted accidentally.

## Assumptions

- A user may have multiple roles; permissions are normally assigned to roles and inherited by users.
- Direct user permissions are intentionally deferred; the schema/API can add them later without changing permission names.
- Drag/drop is progressive enhancement; explicit move/nesting controls remain available.

## Plan

1. Add backward-compatible schema and seed/migrate the current administrator into users, roles and permissions.
2. Add centralized identity/permission helpers and enforce permissions on protected operations.
3. Add category hierarchy and menu persistence/API, then build accessible management UI and public rendering.
4. Add user/role management UI and tests; update architecture/design documentation.
5. Rebuild Menu Manager sources/tree controls, harden recursive cycle checks and make branch deletion explicit and authenticated.

## Self-review

- [x] Scope/backward compatibility
- [x] Secrets/password handling
- [x] Hierarchy cycles/path safety
- [x] Authorization and lockout prevention
- [x] Persistence/migration
- [x] No new unexplained business/configuration magic values

## Test plan

- [x] RBAC inheritance and denied-operation tests
- [x] Category/menu hierarchy and ordering tests
- [ ] User lifecycle browser tests
- [x] Build and existing suite
- [ ] Runtime smoke test

## Test report

| Check | Status | Evidence / reason |
| --- | --- | --- |
| Build | PASS | `pnpm build` completed after schema, middleware, admin and public menu changes. |
| Existing and new tests | PASS | `pnpm test`: 7/7 test files pass. |
| RBAC inheritance | PASS | Migrated admin inherits every named permission through `super-admin`. |
| Cycle protection | PASS | Category and menu self-parent attempts are rejected and test data is cleaned. |
| Initial test run | FAIL → FIXED | Node ESM required `.ts` on the new internal permission imports; corrected and rerun successfully. |
| Runtime/browser smoke | NOT RUN | Sandbox previously rejects binding `127.0.0.1:4321` with `EPERM`; independent UI test remains required. |
| Current-menu migration | PASS | Test verifies persisted Home and nested Category navigation; migration v3 also repairs existing category items that had no managed parent. |
| Menu source/nesting build | PASS | Astro build validates recursive public menu and post/page/category builder sources. |
| Menu Manager rebuild | PASS | `pnpm build` completed with recoverable system sources, depth-first tree, filtered parent controls and guarded public recursion. |
| Recursive hierarchy tests | PASS | `test/menu-manager.test.js` verifies Home/About sources, descendant exclusion, ancestor-cycle rejection and recursive branch deletion with cleanup. |
| Existing access-control fixture | FAIL | `test/access-control.test.js` expects seeded `Trang chủ`, but current workspace data had that sample row deleted before this change. The permanent source now allows it to be restored from UI; agent did not mutate sample data. |

## Blockers

Review gate remains blocked by the pre-existing missing `Trang chủ` sample row in the workspace database. Build and new hierarchy tests pass; independent browser/accessibility testing is still required.

## Reopened regression

The managed menu was initially empty and only the public header had a legacy fallback. Reopened to migrate the current public navigation into editable menu records and add post/page/category source dragging with nested drop targets.

Resolved with a versioned, idempotent navigation migration that merges the current Home, visible Pages, Category tree and About links into `menu_items` without discarding existing custom items. The builder now exposes published Posts, Pages and Categories as draggable sources. Dropping a source or existing item onto another menu item creates nesting; dropping on the root returns it to the top level. Public rendering is recursive for arbitrary menu depth, while parent selects and move buttons remain non-drag alternatives.

Reworked Menu Manager after acceptance feedback. Added permanent recoverable sources for Home/About, using label+URL identity so the Category root URL `/` cannot incorrectly suppress Home. The current menu renders depth-first with explicit level badges; each parent select removes self and all descendants. Service traversal now tracks visited ancestors, rejects missing parents and corrupted cycles, and branch deletion uses a recursive CTE. Mutation endpoints verify the authenticated session directly. Browser `confirm()` was replaced by a destructive dialog explaining recursive deletion.
