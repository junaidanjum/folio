# Document pagination

Folio measures rendered Markdown into physical pages before printing. This work fixes excess space before tables and missing code in long documents, originally reproduced with `SIL_VERIFICATION_BACKEND_HANDOFF.md`.

## Implemented behavior

- Fenced code renders as one valid block, including fences without a language label.
- Code splits at rendered line boundaries while preserving syntax spans and text.
- Tables split at row boundaries with repeated headers and stable column widths.
- Lists split by item. Paragraphs, oversized list items, wrapped code lines, and oversized table cells split further while preserving inline formatting and Unicode code points.
- Headings stay with the first fragment of the following block where it fits.
- Fragments are measured at the actual content width with their source styles. Font, image, diagram, and highlighting updates trigger repagination.
- Print-link URL styling is included in preview measurements. A 1 mm WebKit height allowance is applied consistently to pagination and printed pages to avoid extra blank sheets.

## Failure behavior

Printing and PDF export wait for pending layout assets. If an indivisible object cannot fit, Folio shows a layout warning, exposes the full unpaginated document for inspection, and blocks print/export to prevent incomplete output.

Custom CSS can affect layout. Check the resulting PDF when using unusual overrides.

## Verification

The original reproduction contained a 4,516 px code block clipped on one page. After the initial fix, browser verification produced nine pages at default settings, preserved all 4,385 code characters and every table row, and kept every block within the printable area. The Definitions heading shared a page with the first table rows.

That result records the original repair. The later alpha verification used the [kitchen-sink fixture](../../fixtures/kitchen-sink.md) and generated oversized-content fixtures; it did not rerun the original Viscos document.

Regression coverage includes continuation headers, heading placement, code text and syntax spans, unlabelled fences, asynchronous highlighting, long text/list/table splitting, retained inline ancestors, and blocked printing for pending or failed layouts.

The packaged app's native PDF export was also checked for nonblank pages and correct code, tables, diagrams, math, images, and footers. See the [alpha verification record](public-alpha.md) for evidence and remaining gaps.
