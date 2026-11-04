import { FileText, FolderOpen } from 'lucide-react'

const folioMark = new URL('../assets/folio-mark.svg', import.meta.url).href

type EmptyStateProps = {
  onOpen: () => void
  recentPaths: string[]
  onRecent: (path: string) => void
}

export const EmptyState = ({ onOpen, recentPaths, onRecent }: EmptyStateProps) => (
  <main className="empty-state">
    <input id="folio-browser-file-input" className="sr-only" type="file" accept=".md,.markdown,text/markdown" tabIndex={-1} aria-hidden="true" />
    <img className="folio-mark" src={folioMark} alt="" aria-hidden="true" />
    <p className="empty-wordmark">
      folio<span>.</span>
    </p>
    <h1>Markdown, ready for paper.</h1>
    <p>Open a document to see it beautifully typeset, page by page.</p>
    <button className="open-button" onClick={onOpen}>
      <FolderOpen size={17} />
      Open Markdown file
    </button>
    <span className="drop-hint">or drop a .md file anywhere</span>
    {recentPaths.length > 0 ? (
      <section className="recent-files">
        <h2>Recent</h2>
        {recentPaths.map((path) => (
          <button key={path} onClick={() => onRecent(path)}>
            <FileText size={15} />
            <span>
              <strong>{path.split('/').pop()}</strong>
              <small>{path}</small>
            </span>
          </button>
        ))}
      </section>
    ) : null}
  </main>
)
