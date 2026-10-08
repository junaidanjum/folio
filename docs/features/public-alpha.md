# Public alpha preparation

Prepare an unsigned macOS alpha for Apple Silicon and Intel. Do not publish or upload it during this task.

## Work

- Split long paragraphs, lists, oversized table rows, and wrapped code lines without losing text or inline formatting.
- Fail visibly when an indivisible object cannot fit; keep content readable and prevent incomplete printing.
- Handle native drops, stale reload events, and editor saves that replace files atomically.
- Verify file opening and printing/PDF behavior in the packaged app, recording actual evidence and remaining gaps.
- Build a universal macOS app and DMG, add a repeatable unsigned artifact workflow, and document installation and limitations.
- Commit the verified work locally.

## Distribution decision

The user chose an unsigned alpha because no Apple Developer account/certificate is available. Developer ID signing and notarization remain out of scope for this alpha. Ad-hoc signing may be used for bundle integrity; it does not authenticate the publisher or remove Gatekeeper restrictions.

## Verification — 2026-10-08

- 35 frontend tests pass, including long text/list/table splitting, retained inline ancestors, native drop routing, stale reload suppression, and blocked printing for pending/failed layouts.
- Frontend lint, formatting, TypeScript, and production build pass. Rust tests, Clippy with warnings denied, and formatting pass.
- Real Chromium checks pass in screen and print media for A4 portrait and Letter landscape, including larger text, heading numbering, link URLs, and oversized content. Compared all code text, paragraphs, list text, and table cells with the source; no blocks exceeded page bounds.
- The packaged universal app opened the test file using the native picker, recent files, Finder Open With while running, and Finder Open With from a cold launch.
- The packaged app reloaded a disposable Markdown file after atomic replacement.
- Native Save as PDF was exercised. A reproduced six-sheet/three-content-page rounding bug was fixed; the resulting PDF contains three nonblank pages. Rendered pages were visually inspected for code, table, diagram, math, local image, and footer output.
- The PDF inspection also exposed packaged inline-style and syntax-highlighting failures. Moved the static boot styles out of HTML to avoid generated style hashes overriding the intended inline-style policy; switched Shiki to its JavaScript engine without widening script permissions. Re-exported and visually verified the result.
- Universal Mach-O contains arm64 and x86_64 slices. Ad-hoc bundle integrity verification passes. The DMG builds locally. Intel execution is not hardware-tested.
- Native drag/drop routing has automated regression coverage; a physical Finder-to-window drag remains a manual release check. Physical printer output and the GitHub workflow have not been exercised in this environment.

## Remaining public-distribution limits

Unsigned alpha only, as requested. No Developer ID identity or notarization. No public release was uploaded. A signed general release requires Apple credentials and additional Intel/printer/manual-drag verification.
