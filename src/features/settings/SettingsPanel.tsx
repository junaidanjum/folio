import { X } from 'lucide-react'
import { Switch } from '@base-ui/react/switch'
import type { WheelEvent } from 'react'
import { FolioSelect } from '../../components/FolioSelect'
import { documentThemes } from '../../document/themes'
import { useSettingsStore } from '../../stores/settings-store'
import type { DocumentSettings, MarginPreset, Orientation, PaperSize, ThemeId } from '../../types/document'

type SettingsPanelProps = { onClose: () => void }

const Toggle = ({
  label,
  setting,
}: {
  label: string
  setting: keyof Pick<DocumentSettings, 'pageNumbers' | 'numberedHeadings' | 'printLinkUrls' | 'codeLabels' | 'printBackgrounds' | 'customCssEnabled'>
}) => {
  const checked = useSettingsStore((state) => state[setting])
  const update = useSettingsStore((state) => state.update)
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <Switch.Root className="folio-switch" checked={checked} onCheckedChange={(nextChecked) => update({ [setting]: nextChecked })}>
        <Switch.Thumb className="folio-switch-thumb" />
      </Switch.Root>
    </label>
  )
}

const MARGIN_OPTIONS: ReadonlyArray<{ label: string; value: MarginPreset }> = [
  { label: 'Narrow', value: 'narrow' },
  { label: 'Normal', value: 'normal' },
  { label: 'Wide', value: 'wide' },
]

const containScroll = (event: WheelEvent<HTMLDivElement>) => {
  const panel = event.currentTarget
  const atTop = panel.scrollTop <= 0
  const atBottom = Math.ceil(panel.scrollTop + panel.clientHeight) >= panel.scrollHeight

  if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) event.preventDefault()
}

export const SettingsPanel = ({ onClose }: SettingsPanelProps) => {
  const settings = useSettingsStore()

  return (
    <aside className="inspector" aria-label="Document settings">
      <header className="inspector-header">
        <div>
          <span className="eyebrow">Inspector</span>
          <h2>Document style</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close settings">
          <X size={17} />
        </button>
      </header>
      <div className="inspector-scroll" onWheel={containScroll}>
        <section>
          <h3>Theme</h3>
          <div className="theme-grid">
            {documentThemes.map((theme) => (
              <button
                key={theme.id}
                className={`theme-card${settings.theme === theme.id ? ' selected' : ''}`}
                onClick={() => settings.update({ theme: theme.id as ThemeId })}
              >
                <span className={`theme-swatch theme-${theme.id}`}>Ag</span>
                <span>
                  <strong>{theme.name}</strong>
                  <small>{theme.description}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
        <section>
          <h3>Typography</h3>
          <label className="field">
            <span>
              Size <output>{settings.fontSize}px</output>
            </span>
            <input
              type="range"
              min="11"
              max="21"
              value={settings.fontSize}
              onChange={(event) => settings.update({ fontSize: Number(event.target.value) })}
            />
          </label>
          <label className="field">
            <span>
              Line height <output>{settings.lineHeight.toFixed(2)}</output>
            </span>
            <input
              type="range"
              min="1.3"
              max="2"
              step="0.05"
              value={settings.lineHeight}
              onChange={(event) => settings.update({ lineHeight: Number(event.target.value) })}
            />
          </label>
          <label className="field">
            <span>
              Paragraph spacing <output>{settings.paragraphSpacing.toFixed(1)}×</output>
            </span>
            <input
              type="range"
              min="0.4"
              max="1.8"
              step="0.1"
              value={settings.paragraphSpacing}
              onChange={(event) => settings.update({ paragraphSpacing: Number(event.target.value) })}
            />
          </label>
        </section>
        <section>
          <h3>Page</h3>
          <div className="segmented">
            <button className={settings.paperSize === 'a4' ? 'active' : ''} onClick={() => settings.update({ paperSize: 'a4' as PaperSize })}>
              A4
            </button>
            <button className={settings.paperSize === 'letter' ? 'active' : ''} onClick={() => settings.update({ paperSize: 'letter' as PaperSize })}>
              Letter
            </button>
          </div>
          <div className="segmented">
            <button
              className={settings.orientation === 'portrait' ? 'active' : ''}
              onClick={() => settings.update({ orientation: 'portrait' as Orientation })}
            >
              Portrait
            </button>
            <button
              className={settings.orientation === 'landscape' ? 'active' : ''}
              onClick={() => settings.update({ orientation: 'landscape' as Orientation })}
            >
              Landscape
            </button>
          </div>
          <div className="select-field">
            <span>Margins</span>
            <FolioSelect
              label="Page margins"
              value={settings.marginPreset}
              options={MARGIN_OPTIONS}
              onValueChange={(marginPreset) => settings.update({ marginPreset })}
            />
          </div>
        </section>
        <section>
          <h3>Document</h3>
          <Toggle label="Page numbers" setting="pageNumbers" />
          <Toggle label="Numbered headings" setting="numberedHeadings" />
          <Toggle label="Print link URLs" setting="printLinkUrls" />
          <Toggle label="Code language labels" setting="codeLabels" />
          <Toggle label="Print backgrounds" setting="printBackgrounds" />
        </section>
        <section>
          <h3>Custom CSS</h3>
          <Toggle label="Enable custom CSS" setting="customCssEnabled" />
          <textarea
            aria-label="Custom document CSS"
            spellCheck="false"
            value={settings.customCss}
            onChange={(event) => settings.update({ customCss: event.target.value })}
            placeholder={'h1 {\n  letter-spacing: -0.03em;\n}'}
          />
          <button className="text-button" onClick={settings.resetCustomCss}>
            Reset CSS
          </button>
        </section>
      </div>
    </aside>
  )
}
