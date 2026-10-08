# macOS alpha readiness

**Status: locally built unsigned alpha, version 0.1.0.** The universal app and DMG contain Apple Silicon and Intel binaries. No public release has been uploaded. This is an experimental build with outstanding distribution checks, not a signed general release.

See the [alpha guide](../alpha-release.md) for installation, replacement, build commands, and artifact locations.

## Delivered

- Long paragraphs, lists, code, and oversized table rows split across pages without losing text or inline formatting.
- Content that cannot fit fails visibly, remains readable, and blocks incomplete printing.
- Native file-open events are retained during startup, so Finder Open With opens the requested document on both cold and warm launches.
- Native drop routing, stale reload suppression, and editor saves that replace files atomically are handled.
- Native PDF output avoids the reproduced extra blank sheets and renders syntax highlighting, math, and diagrams in the packaged app.
- A universal app and DMG build locally. A manually triggered GitHub Actions workflow prepares the same alpha artifacts without publishing a release.

The build uses ad-hoc signing for integrity. Developer ID signing and notarization are not configured; ad-hoc signing does not authenticate the publisher or remove Gatekeeper restrictions.

## Verification — 2026-10-08

| Area                | Evidence                                                                                                                                                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend automation | All 35 tests passed, along with lint, formatting, TypeScript checks, and the production build.                                                                                                                                                           |
| Rust automation     | Tests, formatting, and Clippy with warnings denied passed.                                                                                                                                                                                               |
| Browser pagination  | Chromium screen and print checks passed for A4 portrait and Letter landscape, including larger text, heading numbering, link URLs, and oversized content. Code, paragraphs, lists, and table cells retained source text; no blocks exceeded page bounds. |
| Native file opening | The packaged app opened files through the picker, recent files, and Finder Open With, both while running and from a cold launch.                                                                                                                         |
| External saves      | The packaged app reloaded a disposable Markdown file after atomic replacement.                                                                                                                                                                           |
| Native PDF          | Save as PDF produced three nonblank pages after fixing a six-sheet/three-content-page rounding issue. Rendered pages were visually checked for code, tables, diagrams, math, local images, and footers.                                                  |
| Packaging           | The universal Mach-O contains arm64 and x86_64 slices. Ad-hoc bundle integrity verification passed, and the DMG built locally.                                                                                                                           |

Browser verification used the repository's kitchen-sink fixture and generated stress content. The native PDF checks used a disposable fixture. Historical verification of the reported Viscos document is recorded separately in [document pagination](document-pagination.md).

Packaged PDF inspection exposed two additional issues: static inline boot styles interfered with the intended inline-style policy, and syntax highlighting failed in the packaged runtime. Boot styles now load from an external stylesheet, and Shiki uses its JavaScript engine without widening script permissions. The exported result was visually verified again after these changes.

## Outstanding checks

- [ ] Execute the packaged app on Intel hardware.
- [ ] Perform a physical Finder-to-window drag; native drop routing currently has automated coverage.
- [ ] Verify physical printer output.
- [ ] Run the GitHub Actions alpha workflow and inspect its downloaded artifacts.
- [ ] Verify installation of a downloaded, quarantined DMG on a clean Mac.

Developer ID signing and notarization remain prerequisites for a signed general release. Windows and Linux builds are outside the validated alpha scope.
