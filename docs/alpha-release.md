# Folio macOS alpha

Version 0.1.0 is an experimental macOS build for Apple Silicon and Intel. It is ad-hoc signed for bundle integrity, but is not Developer ID signed or notarized. The signature does not authenticate the publisher.

Download [Folio alpha](https://github.com/junaidanjum/folio/releases/tag/alpha) for the refreshed interface and overlapping-page app icon. The app still reports version 0.1.0. See the [verification record and remaining checks](features/public-alpha.md).

## Install or replace

1. Quit Folio.
2. Open `Folio_0.1.0_universal.dmg`.
3. Drag Folio into Applications and choose **Replace** if prompted.
4. Launch the copy in Applications, then open a Markdown file.

Settings and recent-file paths are stored separately from the app. Keep the previous DMG to roll back by repeating these steps with the older version.

Use Finder's **Open With → Folio** to open a document explicitly. Double-clicking requires Folio to be associated with the file; replacing the app does not itself select it as the default Markdown app.

macOS may block downloaded unsigned builds. Installation of a quarantined download on a clean Mac has not been verified. Do not disable Gatekeeper globally. Developer ID signing and notarization remain required work for a signed general release; see [Tauri macOS signing](https://v2.tauri.app/distribute/sign/macos/).

## Build locally

Use macOS with the [development prerequisites](../README.md#development), then run:

```bash
pnpm install --frozen-lockfile
rustup target add aarch64-apple-darwin x86_64-apple-darwin
pnpm check
pnpm rust:fmt
pnpm rust:clippy
pnpm rust:test
pnpm build:alpha
```

Outputs, relative to the repository root:

```text
src-tauri/target/universal-apple-darwin/release/bundle/macos/Folio.app
src-tauri/target/universal-apple-darwin/release/bundle/dmg/Folio_0.1.0_universal.dmg
```

The [alpha configuration](../src-tauri/tauri.alpha.conf.json) selects ad-hoc signing. No Apple signing credentials are needed.

Verify both architecture slices and the bundle signature:

```bash
lipo src-tauri/target/universal-apple-darwin/release/bundle/macos/Folio.app/Contents/MacOS/folio -verify_arch arm64 x86_64
codesign --verify --deep --strict src-tauri/target/universal-apple-darwin/release/bundle/macos/Folio.app
```

To generate a checksum alongside the local DMG:

```bash
cd src-tauri/target/universal-apple-darwin/release/bundle/dmg
shasum -a 256 Folio_0.1.0_universal.dmg > SHA256SUMS.txt
shasum -a 256 -c SHA256SUMS.txt
```

A checksum detects changes to the artifact; it does not establish publisher identity. `pnpm build:alpha` does not generate the checksum automatically.

## GitHub Actions build

Run **Build macOS alpha** manually from the repository's Actions tab. The [workflow](../.github/workflows/alpha.yml) runs frontend and Rust checks, builds the universal DMG, verifies the binary and signature, and uploads the DMG and a SHA-256 checksum in the `folio-macos-universal-unsigned-alpha` artifact.

Artifact access follows the repository's GitHub permissions. The workflow does not publish a GitHub release and has not yet been exercised. Its checksum entries use repository-relative build paths; local checksums generated above use the DMG filename.

## Check before sharing

- Open `.md` and `.markdown` files through the picker, Finder, and a physical drag/drop. Check launch-time opening and opening while already running.
- Save changes externally, including atomic file replacement. Verify reload; closing a document must not reopen it on the next save.
- Check long paragraphs, nested lists, long code, tables, images, diagrams, and math. Change paper size, orientation, margins, and text size.
- Export using the native PDF dialog. Check page count, blank sheets, final code lines, repeated headers, and footers. Cancel and reopen the dialog.
- Test on Intel hardware, a physical printer, and a clean Mac receiving a downloaded DMG.

A universal binary verifies that both architectures compiled; it does not establish Intel runtime compatibility. The [verification record](features/public-alpha.md) distinguishes completed checks from outstanding ones.

## Limitations

- Unsupported indivisible content or custom CSS that cannot fit triggers a visible layout error and blocks print/export. Full unpaginated content remains available for inspection.
- Layout changes from unusual custom CSS require checking the exported PDF.
- Remote images are blocked. Local PNG, JPEG, GIF, and WebP images must be inside the document directory. SVG file images are unsupported.
- PDF export uses the native Save as PDF dialog. There is no automatic updater; replace the app manually.
- Alpha support is macOS only. Windows and Linux releases are not validated.
