# Document pagination

Fix spacing and missing code when previewing long Markdown documents, using `SIL_VERIFICATION_BACKEND_HANDOFF.md` as the reproduction.

- Render fenced code as a single valid block, including fences without a language.
- Split code across pages at rendered line boundaries while preserving syntax spans and all text.
- Split tables at row boundaries and repeat their headers.
- Keep headings with the first fragment of the following block; measure page fragments at the actual content width.
- Repaginate after asynchronous syntax highlighting updates.
- Verify text preservation and page bounds with the reported document, plus regression tests and existing checks.

## Verification

- Reproduced the reported file with a 4,516 px code block clipped on one page.
- Browser verification after the fix: nine pages at default settings, all 4,385 code characters preserved, all table rows preserved, and no blocks below the printable content area. The Definitions heading and first table rows share a page.
- Regression coverage includes table continuation headers, heading placement, code text and syntax spans, unlabelled fences, and asynchronous highlighting snapshots.
- The subsequent alpha work splits oversized text and table cells. Content that still cannot fit triggers a visible fallback and blocks incomplete printing; see `public-alpha.md`.
