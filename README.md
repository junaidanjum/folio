# Folio

Folio is a local-first desktop print preview for Markdown. Open a document, choose its style, preview physical pages, then print or save a PDF.

**Current status: macOS alpha (0.1.0).** Download the universal Apple Silicon and Intel installer from [alpha](https://github.com/junaidanjum/folio/releases/tag/alpha), or build from source. It is ad-hoc signed, without Developer ID signing or notarization. Intel runtime testing and other release checks remain outstanding.

See the [installation and build guide](docs/alpha-release.md) and [verification record](docs/features/public-alpha.md).

## Features

- Open `.md` and `.markdown` files using the file picker, Finder Open With, recent files, or drag and drop.
- Reload documents when an external editor saves them, including saves that replace the file.
- Render tables, highlighted code, Mermaid diagrams, math, and local raster images.
- Choose document themes, typography, margins, A4 or Letter paper, and portrait or landscape orientation.
- Split long text, lists, code, and tables across pages, with repeated table headers.
- Print or save a PDF through the native macOS print dialog.

Folio previews files edited in another application. Local documents stay on your device.

## Install and use

If you have a built alpha DMG, quit Folio, open the DMG, and drag Folio into Applications. Choose **Replace** to update an existing installation. Keep the previous DMG for rollback. See the [alpha guide](docs/alpha-release.md#install-or-replace) for installation limitations.

1. Open a Markdown file from Folio or use Finder's **Open With → Folio**. Double-clicking opens Folio only when it is the file's associated app.
2. Adjust the document settings and inspect the preview.
3. Choose **Print**, or choose **Export PDF** and use the print dialog's **Save as PDF** destination.

### Keyboard shortcuts

| Action          | macOS shortcut |
| --------------- | -------------- |
| Open file       | `⌘O`           |
| Print           | `⌘P`           |
| Export PDF      | `⇧⌘E`          |
| Toggle settings | `⌘,`           |
| Zoom in / out   | `⌘+` / `⌘−`    |
| Reset zoom      | `⌘0`           |

## Development

Prerequisites:

- Node.js 20+ and pnpm 10+; the alpha workflow uses Node.js 22.
- Rust stable and the [Tauri 2 platform prerequisites](https://v2.tauri.app/start/prerequisites/).
- macOS for building and testing this alpha.

```bash
pnpm install --frozen-lockfile
pnpm tauri dev
```

For a browser-only development preview, run `pnpm dev` and open the local URL it prints, normally `http://localhost:1420`. Do not open `index.html` directly. Browser file picking works, but native paths, recent-file reopening, file watching, relative filesystem images, and printing require the desktop app.

The marketing landing page is available at `http://localhost:1420/landing.html`. It has a separate entry point and stylesheet; the desktop app still opens at `/`. Both entry points are included in `pnpm build`.

### Checks

```bash
pnpm check
pnpm rust:fmt
pnpm rust:clippy
pnpm rust:test
```

`pnpm check` runs lint, formatting, frontend tests, TypeScript checks, and the production frontend build. Open [the kitchen-sink fixture](fixtures/kitchen-sink.md) in the packaged app to check rendering and native PDF output. Build a universal DMG using the [alpha build instructions](docs/alpha-release.md#build-locally).

## Architecture

- `src/document` owns rendering, pagination, print styling, diagrams, highlighting, and themes.
- `src/features/files` owns the native/local file boundary.
- `src/features/settings` owns the document inspector.
- `src/stores` contains document state and persisted settings.
- `src-tauri` validates Markdown paths, reads files, watches external changes, and handles native file-open events and launch arguments.

Document themes map typed definitions to scoped CSS variables. Raw HTML is sanitized, Markdown scripts are not executed, and Mermaid uses strict security mode. See [document pagination](docs/features/document-pagination.md) for layout behavior and regression coverage.

## Limitations

- This is an experimental macOS alpha. Windows and Linux releases are not validated.
- Content that cannot fit a page shows a layout warning and blocks print/export. Full unpaginated content remains available for inspection.
- Unusual custom CSS needs checking in the exported PDF.
- Remote images are blocked. Native local images support PNG, JPEG, GIF, and WebP inside the document directory; SVG file images are unsupported.
- PDF export uses the native print dialog; one-click PDF saving is not implemented.
- Updates require manually replacing the app. There is no automatic updater.

## License

Folio is available under the [MIT License](LICENSE).
