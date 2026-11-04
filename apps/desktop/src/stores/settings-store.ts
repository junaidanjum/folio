import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DocumentSettings } from '../types/document'

export const defaultSettings: DocumentSettings = {
  theme: 'minimal',
  paperSize: 'a4',
  orientation: 'portrait',
  marginPreset: 'normal',
  fontSize: 15,
  lineHeight: 1.65,
  paragraphSpacing: 0.9,
  zoom: 0.85,
  pageNumbers: true,
  numberedHeadings: false,
  printLinkUrls: false,
  codeLabels: true,
  printBackgrounds: true,
  customCssEnabled: false,
  customCss: '',
}

type SettingsStore = DocumentSettings & {
  update: (settings: Partial<DocumentSettings>) => void
  resetCustomCss: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      update: (settings) => set(settings),
      resetCustomCss: () => set({ customCss: '', customCssEnabled: false }),
    }),
    { name: 'folio-settings' },
  ),
)
