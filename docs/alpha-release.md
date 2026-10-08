# Folio macOS alpha

Folio is an experimental local Markdown preview and printing app. This alpha targets macOS on Apple Silicon and Intel. It is not Developer ID signed or notarized. Its ad-hoc signature checks bundle integrity but does not verify the publisher.

## Build

```bash
pnpm install --frozen-lockfile
rustup target add aarch64-apple-darwin x86_64-apple-darwin
pnpm check
pnpm rust:fmt
pnpm rust:clippy
pnpm rust:test
pnpm build:alpha
```

Outputs are under `src-tauri/target/universal-apple-darwin/release/bundle/`: `macos/Folio.app` and `dmg/Folio_0.1.0_universal.dmg`.

The manually triggered **Build macOS alpha** workflow produces a universal DMG and SHA-256 checksum as private workflow artifacts. It does not publish a GitHub release. No Apple credentials are required for this unsigned alpha.

## Install or replace

Quit Folio, open the DMG, and drag Folio into Applications. Choose Replace if prompted. Keep the previous DMG if you need to roll back. Settings and recent paths are stored separately from the app.

macOS may block downloaded unsigned builds. This is a known limitation of this alpha. Do not disable Gatekeeper or remove quarantine globally. General distribution with normal installation requires Developer ID signing and notarization; see [Tauri macOS signing](https://v2.tauri.app/distribute/sign/macos/).

## Test before sharing a build

- Open `.md` and `.markdown` files through the picker, Finder, and a native drag/drop. Check both launch-time opening and opening while already running.
- Save changes externally, including an atomic file replacement. Verify the document reloads; closing a document must not reopen it on the next save.
- Check long paragraphs, nested lists, long code, tables, images, diagrams, and math. Change paper size, orientation, margins, and text size.
- Export using the native PDF dialog. Check page count, no blank sheets, final lines of code, repeated headers, and page footers. Cancel and reopen the dialog.
- Check the Intel build on Intel hardware before claiming runtime compatibility there. A universal binary alone verifies compilation, not runtime behavior.

## Limitations

- Unsupported indivisible content or custom CSS that cannot fit triggers a visible layout error and blocks Folio's print/export action. Full unpaginated content remains available for inspection.
- Layout changes from unusual custom CSS require checking the exported PDF.
- Remote images are blocked by the desktop content security policy. Local raster images must be inside the document directory. SVG file images are unsupported.
- PDF export uses the native Save as PDF dialog. There is no automatic updater; install newer builds manually.
- Alpha support is macOS only. Windows and Linux releases are not validated.
