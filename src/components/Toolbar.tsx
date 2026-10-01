import { FileDown, Minus, Plus, Printer, Settings2 } from 'lucide-react'
import { documentThemes } from '../document/themes'
import { startWindowDrag } from '../features/window/window-drag'
import { useSettingsStore } from '../stores/settings-store'
import type { OpenDocument, PaperSize, ThemeId } from '../types/document'
import { FolioSelect } from './FolioSelect'

type ToolbarProps = {
  document: OpenDocument
  status: string
  onSettings: () => void
  onPrint: () => void
  onExport: () => void
  busy: 'export' | 'print' | null
}

const ZOOM_STEPS = [0.5, 0.75, 0.85, 1, 1.25, 1.5]
const PAPER_OPTIONS: ReadonlyArray<{ label: string; value: PaperSize }> = [
  { label: 'A4', value: 'a4' },
  { label: 'Letter', value: 'letter' },
]

export const Toolbar = ({ document, status, onSettings, onPrint, onExport, busy }: ToolbarProps) => {
  const settings = useSettingsStore()
  const zoomBy = (direction: -1 | 1) => {
    const closest = ZOOM_STEPS.reduce(
      (best, zoom, index) => (Math.abs(zoom - settings.zoom) < Math.abs(ZOOM_STEPS[best] - settings.zoom) ? index : best),
      0,
    )
    settings.update({ zoom: ZOOM_STEPS[Math.max(0, Math.min(ZOOM_STEPS.length - 1, closest + direction))] })
  }

  return (
    <header className="toolbar" onMouseDown={(event) => void startWindowDrag(event)}>
      <div className="document-identity">
        <span className="file-mark">M↓</span>
        <span>
          <strong>{document.name}</strong>
          <small>{status === 'reloaded' ? 'Updated just now' : (document.path ?? 'Local file')}</small>
        </span>
      </div>
      <div className="zoom-control" aria-label="Preview zoom">
        <button onClick={() => zoomBy(-1)} aria-label="Zoom out">
          <Minus size={14} />
        </button>
        <button className="zoom-value" onClick={() => settings.update({ zoom: 1 })}>
          {Math.round(settings.zoom * 100)}%
        </button>
        <button onClick={() => zoomBy(1)} aria-label="Zoom in">
          <Plus size={14} />
        </button>
      </div>
      <div className="toolbar-actions">
        <FolioSelect
          className="toolbar-select theme-select"
          label="Document theme"
          value={settings.theme}
          options={documentThemes.map((theme) => ({ label: theme.name, value: theme.id as ThemeId }))}
          onValueChange={(theme) => settings.update({ theme })}
        />
        <FolioSelect
          className="toolbar-select compact"
          label="Paper size"
          value={settings.paperSize}
          options={PAPER_OPTIONS}
          onValueChange={(paperSize) => settings.update({ paperSize })}
        />
        <button className="icon-button" onClick={onSettings} aria-label="Open settings">
          <Settings2 size={17} />
        </button>
        <button className="secondary-button" onClick={onExport} disabled={busy !== null}>
          <FileDown size={15} />
          {busy === 'export' ? 'Exporting…' : 'Export PDF'}
        </button>
        <button className="primary-button" onClick={onPrint} disabled={busy !== null}>
          <Printer size={15} />
          {busy === 'print' ? 'Preparing…' : 'Print'}
        </button>
      </div>
    </header>
  )
}
