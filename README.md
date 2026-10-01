# Folio

Folio is a local-first desktop print preview for Markdown. Open a file, see it as physical pages, choose a document style, then print or save the same layout as PDF.

## Prerequisites

- Node.js 20+
- pnpm 10+ (`corepack enable` on supported Node.js installations)
- Rust stable and the [Tauri 2 platform prerequisites](https://v2.tauri.app/start/prerequisites/)

## Run

```bash
pnpm install
pnpm tauri dev
```

The browser-only UI is available with `pnpm dev`. File picking works there, but native path access, recent-file reopening, and file watching require Tauri.

Do not open `index.html` directly as the application. It is the Vite entry point. Use the local URL printed by `pnpm dev` (normally `http://localhost:1420`).

## Verify

```bash
pnpm check
```

Open `fixtures/kitchen-sink.md` to exercise the supported Markdown features.

## Architecture

- `src/document` owns rendering, pagination, print styling, diagrams, highlighting, and themes.
- `src/features/files` owns the native/local file boundary.
- `src/features/settings` owns the document inspector.
- `src/stores` contains small persisted settings and document stores.
- `src-tauri` validates Markdown paths, reads files, watches external changes, and handles launch arguments.

Document themes are typed definitions that map to scoped CSS variables. Adding a theme does not require changing the renderer. Markdown is rendered without script execution, raw HTML is sanitized, Mermaid uses strict security mode, and local files stay on the device.

Native local images are limited to PNG, JPEG, GIF, and WebP files inside the Markdown document's directory. SVG is intentionally rejected because it can contain active content.

## Printing

The preview is measured into physical A4 or Letter sheets. **Print** opens the native macOS print dialog through Tauri. **Export PDF** opens the same native dialog and uses the system Save as PDF destination, preserving the print layout. Printing is intentionally unavailable in the browser-only development preview.

## Known limitations

- Very tall indivisible blocks can be clipped at a page boundary; advanced line-level splitting is future work.
- Browser development mode cannot resolve relative filesystem images because browsers do not expose the source path.
- Silent one-click PDF export is not implemented; the native print dialog provides PDF export with the highest preview parity.

## License

Folio is available under the [MIT License](LICENSE).
