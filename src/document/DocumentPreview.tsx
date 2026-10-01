import { useEffect, useMemo, useRef, useState } from 'react'
import { getTheme } from './themes'
import { MarkdownRenderer } from './MarkdownRenderer'
import { paginateElements } from './pagination'
import type { DocumentSettings, OpenDocument } from '../types/document'

type DocumentPreviewProps = {
  document: OpenDocument
  settings: DocumentSettings
}

const PAPER = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 },
} as const

const MARGINS = {
  narrow: { x: 14, y: 14 },
  normal: { x: 22, y: 20 },
  wide: { x: 30, y: 28 },
} as const

const PX_PER_MM = 96 / 25.4

export const DocumentPreview = ({ document, settings }: DocumentPreviewProps) => {
  const sourceRef = useRef<HTMLDivElement>(null)
  const [pages, setPages] = useState<string[]>([])
  const theme = getTheme(settings.theme)
  const paper = PAPER[settings.paperSize]
  const margin = MARGINS[settings.marginPreset]
  const dimensions = settings.orientation === 'portrait' ? paper : { width: paper.height, height: paper.width }
  const pageStyle = {
    ...theme.variables,
    '--page-width': `${dimensions.width}mm`,
    '--page-height': `${dimensions.height}mm`,
    '--page-margin-x': `${margin.x}mm`,
    '--page-margin-y': `${margin.y}mm`,
    '--document-font-size': `${settings.fontSize}px`,
    '--document-line-height': String(settings.lineHeight),
    '--document-paragraph-spacing': `${settings.paragraphSpacing}em`,
  } as React.CSSProperties

  const paginationKey = useMemo(
    () =>
      JSON.stringify([
        document.content,
        settings.theme,
        settings.paperSize,
        settings.orientation,
        settings.marginPreset,
        settings.fontSize,
        settings.lineHeight,
        settings.paragraphSpacing,
        settings.codeLabels,
      ]),
    [document.content, settings],
  )

  useEffect(() => {
    const source = sourceRef.current
    if (!source) return

    let frame = 0
    const paginate = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const blocks = Array.from(source.children)
        const availableHeight = (dimensions.height - margin.y * 2) * PX_PER_MM
        setPages(paginateElements(blocks, availableHeight))
      })
    }

    paginate()
    const observer = new ResizeObserver(paginate)
    observer.observe(source)
    source.querySelectorAll('img').forEach((image) => image.addEventListener('load', paginate))
    window.document.fonts.ready.then(paginate).catch(() => undefined)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      source.querySelectorAll('img').forEach((image) => image.removeEventListener('load', paginate))
    }
  }, [paginationKey, dimensions.height, margin.y])

  return (
    <main className="preview-viewport" aria-label="Document preview">
      <div className="page-stack" style={{ transform: `scale(${settings.zoom})`, transformOrigin: 'top center' }}>
        {pages.map((page, index) => (
          <article
            className={`paper document-theme theme-${settings.theme}${settings.numberedHeadings ? ' numbered-headings' : ''}${settings.printLinkUrls ? ' print-link-urls' : ''}${settings.printBackgrounds ? '' : ' without-print-backgrounds'}`}
            style={pageStyle}
            key={`${index}-${page.length}`}
          >
            <div className="paper-content" dangerouslySetInnerHTML={{ __html: page }} />
            {settings.pageNumbers ? (
              <footer className="page-footer">
                <span>{document.frontmatter.title ?? document.name}</span>
                <span>
                  {index + 1} / {pages.length}
                </span>
              </footer>
            ) : null}
          </article>
        ))}
      </div>

      <div className={`pagination-source document-theme theme-${settings.theme}`} style={pageStyle} ref={sourceRef} aria-hidden="true">
        {document.frontmatter.title ? (
          <header className="document-title">
            <h1>{document.frontmatter.title}</h1>
            {document.frontmatter.subtitle ? <p className="subtitle">{document.frontmatter.subtitle}</p> : null}
            {document.frontmatter.author || document.frontmatter.date ? (
              <p className="byline">{[document.frontmatter.author, document.frontmatter.date].filter(Boolean).join(' · ')}</p>
            ) : null}
          </header>
        ) : null}
        <MarkdownRenderer content={document.content} documentPath={document.path} showCodeLabels={settings.codeLabels} />
      </div>
      {settings.customCssEnabled && settings.customCss ? <style>{`@scope (.document-theme) { ${settings.customCss} }`}</style> : null}
    </main>
  )
}
