# 001 — Media library and image upload

- **Status:** ready_for_test
- **Owner:** Codex
- **Created:** 2026-11-22
- **Updated:** 2026-11-22

## Scope

Add an authenticated media library for uploading, browsing, copying, selecting and deleting image assets. Integrate selected media into a post cover image and Markdown content.

Rework the folder browsing slice after user acceptance feedback: folders must be visible as persistent explorer-style navigation, and users must be able to create a folder from a context menu without leaving the library view.

## Acceptance criteria

- [x] Admin can upload valid image files and see a clear inline error for rejected files.
- [x] Admin can browse uploaded assets, copy their public URL, and delete unused assets.
- [x] Admin can select a media item as a post cover image or insert Markdown image syntax into the editor.
- [x] Public assets use stable URLs under /uploads/; public users cannot access admin media controls.
- [x] Upload paths cannot be chosen by the client; non-image, oversized and spoofed payloads are rejected.
- [x] Admin can create persistent logical folders and move media between them without client-controlled filesystem paths.
- [x] Delete preview identifies content references and requires a deliberate confirmation when references exist.
- [x] Post editor supports either an internal media asset or an external image URL without conflicting URL validation.
- [x] Media and post flows provide success/error feedback via accessible toast notifications.
- [x] Media Library displays folders in an explorer-style sidebar rather than only inside a filter select.
- [x] Right-clicking the folder area opens a context menu with “Tạo thư mục mới”; the same action is reachable by keyboard and a visible overflow button.
- [x] Folder creation uses a required inline form with saving, validation and error states, then selects the newly created folder without reloading.
- [x] Selecting a folder filters the media grid and exposes a clear empty state for that folder.
- [x] A folder created without reload immediately uses the same explorer row layout and styling as server-rendered folders.
- [x] The create-folder context menu opens from every area of the Media Library workspace, including sidebar, media grid and empty regions.
- [x] Creating a folder while a real folder is selected creates a validated logical subfolder and renders it at the correct tree depth.
- [x] Folder creation persists its parent in an explicit form field so opening/submitting the dialog cannot lose the intended parent.
- [x] A newly created subfolder is inserted directly beneath its parent branch immediately, rather than appended at the end until reload.
- [x] Folder context menu supports upload and recursive folder deletion; root/all pseudo-folders cannot be deleted.
- [x] Folder deletion previews contained files/subfolders and requires force confirmation when any contained image has content references.
- [x] Uploading into a folder returns to that exact folder after reload instead of resetting to “Tất cả ảnh”.
- [x] Media Library has one real root (“Ổ đĩa của tôi”); “Tất cả ảnh” and “Không phân loại” filters are removed.
- [x] Each location shows only its direct child folders and direct files, with child folders navigable from the content pane like Google Drive.
- [x] Breadcrumb/location, upload, create, move and delete consistently treat empty logical path as root.
- [x] File Manager accepts validated images, PDF, ZIP and Office documents; non-images render as file cards and download as attachments.
- [x] Uploaded files retain a sanitized original filename for display while storage keeps opaque generated filenames.
- [x] Image pickers embedded in editors use the same root, direct-child folder navigation, breadcrumb and file-card language as File Manager.
- [x] Picker upload targets the open folder and remains in that folder after refresh, with clear loading, empty and error states.
- [x] File Manager and Media Picker sidebar trees expose independent expand/collapse controls with `aria-expanded` and keyboard-operable buttons.
- [x] Collapsing a branch hides descendants without changing the selected folder; opening a deep folder expands all ancestors and tree state persists for the browser session.
- [x] Tree rows display only the folder basename; full logical paths appear only in breadcrumbs or metadata.

## Dependencies

- Node filesystem write access to public/uploads.
- Existing admin authentication, Astro SSR endpoint support and Post editor DOM IDs.
- A MediaStorage provider selected by environment for each deployment target.

## Security impact

Upload is authenticated. Server generates filenames and does not accept a client path. Permit only PNG, JPEG, WebP and GIF by MIME/type signature, maximum 5 MiB. Delete resolves files only from the controlled upload directory.

## Assumptions

- Local disk media storage is appropriate for the current Node + SQLite deployment.
- Media metadata can be rebuilt from the controlled directory; a SQLite migration is not required for the first vertical slice.
- SVG is excluded because it may carry executable markup.
- Storage selection is configured through MEDIA_STORAGE_DRIVER. Local is the default; S3/R2 implementations must satisfy the same MediaStorage contract without changing routes or UI.
- “Giống File Explorer/Google Drive” means persistent folder navigation and familiar context-menu behavior, not physical nested directories or a new client framework.

## Plan

1. Preserve the authenticated folder API, logical-folder schema and stable media URLs.
2. Replace the select-led folder filter with a responsive explorer sidebar and selected-folder heading/count.
3. Add a bounded context menu plus visible/keyboard fallback that opens an accessible create-folder dialog.
4. Keep the move control synchronized when a folder is created, and show a folder-specific empty state without reload.
5. Add source/behavior regression coverage, run four quality gates and attempt a real runtime smoke test.
6. On acceptance feedback, make dynamic folder rows use global component selectors and delegate context-menu handling from the complete Media Library workspace.
7. Persist the intended parent in an explicit dialog field and derive duplicate checks/API payloads only from that submitted value.
8. Reorder dynamically created folder rows by full logical path so every child is placed inside its parent branch before selection.
9. Add authenticated recursive folder-delete preview/confirmation, context-menu upload/delete actions, and URL-backed folder selection across upload reloads.
10. Replace filter semantics with a single real root and direct-child folder/file navigation in both tree and content pane.
11. Generalize image-only storage into an allowlisted file manager while keeping the post Media Picker image-only.
12. Align editor image pickers with the File Manager root/folder/breadcrumb navigation while preserving image-only selection semantics.
13. Add accessible persistent disclosure controls to both folder trees without coupling expansion to folder selection.
14. Keep full logical paths out of tree labels and reserve them for breadcrumb/location context.

## Implementation notes

The first slice will persist assets in data/uploads, serve them through a public read-only /uploads/[filename] endpoint, and use /api/media for authenticated management. This avoids writing to Astro build output while retaining stable public URLs.

Implemented MediaStorage contract with LocalMediaStorage as the selected local driver. The API manages upload/list/delete, generated opaque filenames prevent client-controlled paths, and the public route only serves safe generated filenames. The admin Media Library provides upload, thumbnail browsing, URL copy and deletion. Post editors now open an in-context Media Picker: uploading/selecting an item sets the cover image, while the Img toolbar opens the same picker and inserts Markdown at the cursor.

Added persistent logical folders, folder filtering and moving, reference-aware force-delete confirmation, external cover URL support, removal of quick sample images from the visible UI, and shared accessible toast feedback. UX follows WordPress Media Library patterns while keeping the current CMS layout compact.

Fixed the post create/update regression caused by invalid nested forms. `MediaPicker` is rendered inside the post editor form, so its upload control now uses a neutral container and button-driven `FormData` instead of an inner form. A source-level regression test prevents a form element from being added to the picker again.

Fixed the remaining edit-page runtime regression: Astro `define:vars` produces an inline classic script, which cannot contain the `marked` ESM import. The editor now uses a bundled module script and reads the post ID from the form dataset. Admin mutation flows for posts, pages, categories and settings now use the shared accessible toast system; successful actions survive redirects/reloads through a session flash message, while invalid forms show a validation toast and focus the first invalid field.

Reworked folder navigation after user acceptance feedback. The Media Library now uses a responsive explorer-style folder rail, folder-specific counts and empty states, plus a bounded right-click context menu. Folder creation is also exposed through visible overflow/primary controls and the keyboard ContextMenu or Shift+F10 gesture. The required modal form reports inline errors and selects a successfully created folder without a page reload. No third-party dependency was added, so no package-version security audit was needed for this revision.

Fixed the follow-up acceptance regressions: dynamically inserted folder rows now use global Astro component selectors, so their layout matches immediately without reload; context-menu delegation now covers the complete Media Library workspace. Added nested logical folders using validated slash-separated paths. Creating `test2` while in `hello` persists `hello/test2`; the server requires the parent to exist and rejects invalid/traversal segments. Folder paths remain metadata only and never become client-controlled filesystem paths.

Replaced the transient parent-only state after a second acceptance failure. The create dialog now contains an explicit “Tạo bên trong” select, initialized from the clicked/current folder. Duplicate detection and the API payload derive from the submitted select value, so the intended parent remains visible and cannot be silently reset to root before submission. Newly created folders are immediately added as future parent choices.

Fixed the remaining client-side tree placement issue. Newly created rows are now reordered by their full logical path before selection, keeping each descendant directly below its parent branch instead of appending it to the bottom until the next server render.

Added context-menu upload and recursive folder deletion. Upload tracks target and return folders separately, persists selection in the URL and restores that location after reload. Folder deletion always loads an authenticated preview of descendants, contained images and content references; referenced images require explicit force confirmation. Root/all pseudo-folders cannot be deleted. Successful recursive deletion removes bytes, metadata and deepest-first logical folder records.

Replaced filter semantics with a Google Drive-style root. “Ổ đĩa của tôi” is the single root, and the content pane shows only direct child folders and direct files. Folder tiles navigate within the same view and the location heading acts as a breadcrumb. Generalized uploads to signature-validated PDF, ZIP, DOCX, XLSX and PPTX alongside images; non-images are forced to download as attachments, while the editor Media Picker remains image-only. SQLite now stores the sanitized original filename for file-manager display.

Aligned the editor Media Picker with File Manager. The modal now has the same single root, folder tree, direct-child folder tiles, clickable breadcrumb, original-name image cards and folder-specific empty/loading/error states. Uploads use the currently open folder and refresh in place. Focus returns to the opener on close; Escape and backdrop dismissal remain available. The picker intentionally filters non-images because its consumers are cover and Markdown image fields.

Added independent disclosure controls to the File Manager and Media Picker trees. Chevron buttons expose `aria-expanded`, are keyboard-operable native controls and do not change the selected folder. Collapsed branches hide descendants; navigating to a deep folder expands its ancestor chain. Each tree persists disclosure state in session storage, including newly created branches.

Fixed the Media Picker label regression where a correctly derived basename was overwritten by the full logical path. Tree rows now show only their final segment (`ok`, `hehe`), while breadcrumb navigation retains the complete hierarchy.

## Self-review

- [x] Scope and backward compatibility — adds routes only; existing external cover-image URLs continue working.
- [x] Không còn magic value trong source code, test, script, migration hay conversion; MIME, size limit, route prefix và cache policy dùng hằng số có tên in new media modules.
- [x] Secrets and sensitive data — no credentials or secrets persisted.
- [x] Path traversal / input validation — generated filename pattern, server-generated output filename, MIME plus magic-byte validation, max size.
- [x] Nested folder validation — every path segment is validated, depth/path length are bounded, parent existence is enforced, and folder paths never reach filesystem APIs.
- [x] Approval behavior — management endpoints require admin session; public reader is read-only.
- [x] Persistence / migration — filesystem provider writes data/uploads outside generated build output; no database migration required.
- [x] Dependency audit — no new package or transitive dependency was introduced; implementation uses platform DOM APIs.

## Test plan

- [x] Unit: media validation and filename/path helpers
- [x] Feature: post editor MediaPicker form-integrity regression
- [x] Build
- [x] Existing test suite
- [x] CLI/runtime smoke test attempted; environment result recorded below

## Test report

| Check                             | Status  | Evidence / reason                                                                                                                                                                                                                                     |
| --------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Media validation unit tests       | PASS    | test/media.test.js rejects unsafe filename, non-image, spoofed and oversized payload.                                                                                                                                                                 |
| Media folder metadata test        | PASS    | test/db.test.js covers persistent folder creation, media move and cleanup.                                                                                                                                                                            |
| Post editor form regression       | PASS    | test/editor-form.test.js confirms MediaPicker cannot introduce a nested form into create/edit post forms.                                                                                                                                             |
| Post editor module regression     | PASS    | test/editor-form.test.js rejects imported dependencies inside an Astro `define:vars` classic script.                                                                                                                                                  |
| Admin feedback audit              | PASS    | No `alert()` remains in admin mutation screens; shared toast/flash feedback covers posts, pages, categories, settings and media.                                                                                                                      |
| Explorer/context-menu regression  | PASS    | `test/media-library-ui.test.js` verifies persistent explorer semantics, mouse and keyboard context-menu paths, required folder form and empty state.                                                                                                  |
| Authentication/security audit     | PASS    | All `/api/media` mutation endpoints still call `isAuthenticated(cookies)`; this revision adds no client path input, storage mutation or dependency.                                                                                                   |
| Build                             | PASS    | `pnpm build` completed successfully on 2026-11-22 after the explorer rework.                                                                                                                                                                          |
| Existing test suite               | PASS    | `pnpm test`: 8 test files passed, including the new Media Library UI regression.                                                                                                                                                                      |
| Dynamic folder/context regression | PASS    | UI regression verifies global dynamic-row styling and workspace-wide context-menu delegation.                                                                                                                                                         |
| Nested folder validation          | PASS    | `test/media-folders.test.js` verifies parent/child joining and rejects traversal segments.                                                                                                                                                            |
| Follow-up build                   | PASS    | `pnpm build` completed after nested-folder and context-menu fixes on 2026-11-22.                                                                                                                                                                      |
| Follow-up test suite              | PASS    | `pnpm test`: 9 test files passed after nested-folder and context-menu fixes.                                                                                                                                                                          |
| Explicit parent regression        | PASS    | UI regression verifies the dialog parent field and that the request serializes the submitted `parent`; `pnpm test` remains 9/9 PASS.                                                                                                                  |
| Explicit parent build             | PASS    | `pnpm build` completed after replacing transient parent state on 2026-11-22.                                                                                                                                                                          |
| Dynamic tree placement            | PASS    | Verified Vietnamese-locale path order (`hello`, `hello/test1`, `hello/test2`, `hello2`) and added a UI regression assertion for immediate row reordering.                                                                                             |
| Tree placement build/tests        | PASS    | `pnpm build` and `pnpm test` (9/9 files) completed after the placement fix.                                                                                                                                                                           |
| Folder delete/upload build        | PASS    | `pnpm build` completed after context upload, recursive delete and location persistence changes.                                                                                                                                                       |
| Relevant feature/unit suite       | PASS    | 9 relevant test files passed, including folder API authorization/reference guards, recursive path matching and UI persistence assertions.                                                                                                             |
| Full existing suite               | FAIL    | `pnpm test`: 9/10 files passed; unrelated `access-control.test.js` expects seeded menu item `Trang chủ`, but the current workspace database no longer contains that sample row. The agent did not restore or modify sample data per repository rules. |
| Root/file-manager build           | PASS    | `pnpm build` completed with a single root, direct-child navigation and generalized file cards.                                                                                                                                                        |
| Root/file-manager relevant tests  | PASS    | 7 relevant test files passed, covering file signatures/limits, attachment serving, folder UI/API, DB migration and editor form integrity.                                                                                                             |
| File Manager picker build         | PASS    | `pnpm build` completed with bundled picker navigation and no nested-form regression.                                                                                                                                                                  |
| Picker regression tests           | PASS    | `test/editor-form.test.js`, `test/media-library-ui.test.js` and `test/media.test.js` pass; picker test verifies root, breadcrumb, direct-child navigation and folder-targeted upload.                                                                 |
| Folder disclosure build           | PASS    | `pnpm build` completed with SSR and dynamically created tree disclosure controls.                                                                                                                                                                     |
| Folder disclosure regressions     | PASS    | File Manager and picker source regressions verify separate disclosure controls, `aria-expanded` and session-persisted state.                                                                                                                          |
| Picker basename regression        | PASS    | `pnpm build` and `test/editor-form.test.js` verify that tree labels use `folderLabel()` rather than full logical paths.                                                                                                                               |
| Runtime smoke test                | NOT RUN | `ASTRO_TELEMETRY_DISABLED=1 pnpm exec astro dev --background` reached server startup but sandbox denied binding `127.0.0.1:4321` with `listen EPERM`; browser interaction still needs independent testing.                                            |

## Blockers

- Review gate is blocked by pre-existing workspace data drift: `access-control.test.js` requires the missing seeded `Trang chủ` menu row. Relevant media tests and build pass; sample data was intentionally left untouched. Independent browser testing also remains unavailable because sandbox port binding is denied.
