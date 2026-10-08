import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core'
import { CircleAlert, X } from 'lucide-react'
import { EmptyState } from './components/EmptyState'
import { Toolbar } from './components/Toolbar'
import { DocumentPreview } from './document/DocumentPreview'
import { documentFromDroppedFile, openDocumentPath, pickMarkdownFile, startWatching } from './features/files/file-service'
import { SettingsPanel } from './features/settings/SettingsPanel'
import { isDesktopApp, openNativePrintDialog } from './features/print/print-service'
import { startWindowDrag } from './features/window/window-drag'
import { countWords } from './lib/markdown'
import { useDocumentStore } from './stores/document-store'
import { useSettingsStore } from './stores/settings-store'

const isTauri = () => Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__)

export const App = () => {
  const { document, recentPaths, status, error, setDocument, setStatus, setError, close } = useDocumentStore()
  const settings = useSettingsStore()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const openGeneration = useRef(0)
  const [busy, setBusy] = useState<'export' | 'print' | null>(null)

  const openPath = useCallback(
    async (path: string) => {
      const generation = ++openGeneration.current
      try {
        setStatus('loading')
        const nextDocument = await openDocumentPath(path)
        if (generation !== openGeneration.current) return
        setDocument(nextDocument)
        await startWatching(nextDocument.path ?? path)
      } catch (cause) {
        if (generation !== openGeneration.current) return
        setError(cause instanceof Error ? cause.message : 'The document could not be opened.')
      }
    },
    [setDocument, setError, setStatus],
  )

  const openFile = useCallback(async () => {
    const generation = ++openGeneration.current
    try {
      setStatus('loading')
      const nextDocument = await pickMarkdownFile()
      if (generation !== openGeneration.current) return
      if (!nextDocument) return setStatus(document ? 'ready' : 'idle')
      setDocument(nextDocument)
      if (nextDocument.path) await startWatching(nextDocument.path)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The document could not be opened.')
    }
  }, [document, setDocument, setError, setStatus])

  const openPrintDialog = useCallback(
    async (purpose: 'export' | 'print') => {
      if (!document || busy) return
      setBusy(purpose)

      try {
        if (!isDesktopApp()) throw new Error('Printing and PDF export are available in the Folio desktop app.')
        await openNativePrintDialog()
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'The PDF could not be created.')
      } finally {
        setBusy(null)
      }
    },
    [busy, document, setError],
  )

  useEffect(() => {
    if (!isTauri()) return
    let cancelled = false
    const cleanup: Array<() => void> = []

    const openPendingFile = async () => {
      if (cancelled) return
      try {
        const path = await invoke<string | null>('initial_file')
        if (path) await openPath(path)
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'The requested document could not be opened.')
      }
    }

    const connect = async () => {
      const unlistenOpen = await listen('markdown-open-requested', openPendingFile)
      if (cancelled) {
        unlistenOpen()
        return
      }
      cleanup.push(unlistenOpen)

      const unlisten = await listen<string>('markdown-changed', async ({ payload }) => {
        const currentDocument = useDocumentStore.getState().document
        if (!currentDocument || currentDocument.path !== payload) return
        try {
          const scrollRatio = window.scrollY / Math.max(1, window.document.body.scrollHeight)
          const nextDocument = await openDocumentPath(payload)
          if (useDocumentStore.getState().document !== currentDocument) return
          setDocument(nextDocument)
          setStatus('reloaded')
          requestAnimationFrame(() => window.scrollTo({ top: window.document.body.scrollHeight * scrollRatio }))
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'The changed document could not be reloaded.')
        }
      })
      if (cancelled) {
        unlisten()
        return
      }
      cleanup.push(unlisten)
      for (const event of ['tauri://drag-enter', 'tauri://drag-leave', 'tauri://drag-drop']) {
        const stop = await listen<{ paths?: string[] }>(event, ({ payload }) => {
          setDragging(event === 'tauri://drag-enter')
          if (event === 'tauri://drag-drop' && payload.paths?.[0]) void openPath(payload.paths[0])
        })
        if (cancelled) {
          stop()
          return
        }
        cleanup.push(stop)
      }
      await openPendingFile()
    }

    const initialize = async () => {
      try {
        await connect()
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'File opening could not be initialized.')
      }
    }
    void initialize()
    return () => {
      cancelled = true
      cleanup.forEach((callback) => callback())
    }
  }, [openPath, setDocument, setError, setStatus])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.metaKey && !event.ctrlKey) return
      const key = event.key.toLowerCase()
      if (key === 'o') {
        event.preventDefault()
        void openFile()
      }
      if (key === 'p') {
        event.preventDefault()
        void openPrintDialog('print')
      }
      if (key === ',') {
        event.preventDefault()
        setSettingsOpen((open) => !open)
      }
      if (key === '0') {
        event.preventDefault()
        settings.update({ zoom: 1 })
      }
      if (key === '+' || key === '=') {
        event.preventDefault()
        settings.update({ zoom: Math.min(1.5, settings.zoom + 0.1) })
      }
      if (key === '-') {
        event.preventDefault()
        settings.update({ zoom: Math.max(0.5, settings.zoom - 0.1) })
      }
      if (key === 'e' && event.shiftKey) {
        event.preventDefault()
        void openPrintDialog('export')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openFile, openPrintDialog, settings])

  const stats = useMemo(() => (document ? { words: countWords(document.content), characters: document.content.length } : null), [document])

  return (
    <div
      className={`app-shell${document ? ' has-document' : ''}${dragging ? ' is-dragging' : ''}`}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setDragging(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        const file = event.dataTransfer.files[0]
        if (file) {
          const readDrop = async () => {
            try {
              setDocument(await documentFromDroppedFile(file))
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : 'The file could not be opened.')
            }
          }
          void readDrop()
        }
      }}
    >
      <div className="window-drag-strip" onMouseDown={(event) => void startWindowDrag(event)} aria-hidden="true" />
      {document ? (
        <Toolbar
          document={document}
          status={status}
          onSettings={() => setSettingsOpen(true)}
          onPrint={() => void openPrintDialog('print')}
          onExport={() => void openPrintDialog('export')}
          busy={busy}
        />
      ) : null}
      {document ? (
        <DocumentPreview document={document} settings={settings} />
      ) : (
        <EmptyState onOpen={() => void openFile()} recentPaths={recentPaths} onRecent={(path) => void openPath(path)} />
      )}
      {document && stats ? (
        <div className="document-stats">
          <button
            onClick={() => {
              openGeneration.current += 1
              close()
            }}
            aria-label="Close document"
          >
            <X size={13} />
          </button>
          <span>{stats.words.toLocaleString()} words</span>
          <span>{Math.max(1, Math.ceil(stats.words / 220))} min read</span>
        </div>
      ) : null}
      {settingsOpen ? <SettingsPanel onClose={() => setSettingsOpen(false)} /> : null}
      {error ? (
        <div className="error-toast" role="alert">
          <CircleAlert size={17} />
          <span>{error}</span>
          <button onClick={() => setStatus(document ? 'ready' : 'idle')} aria-label="Dismiss error">
            <X size={15} />
          </button>
        </div>
      ) : null}
      {dragging ? (
        <div className="drop-overlay">
          <FileTextDrop />
        </div>
      ) : null}
      <style>{`@page { size: ${settings.paperSize === 'a4' ? 'A4' : 'Letter'} ${settings.orientation}; margin: 0; }`}</style>
    </div>
  )
}

const FileTextDrop = () => (
  <div>
    <strong>Drop to open</strong>
    <span>Markdown files only</span>
  </div>
)
