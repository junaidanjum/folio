import type { ThemeId } from '../types/document'

export type DocumentTheme = {
  id: ThemeId
  name: string
  description: string
  variables: Record<string, string>
}

export const documentThemes: DocumentTheme[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Quiet, precise, and spacious',
    variables: {
      '--document-font-body': "'Avenir Next', Avenir, system-ui, sans-serif",
      '--document-font-heading': "'Avenir Next', Avenir, system-ui, sans-serif",
      '--document-font-mono': "'SFMono-Regular', Consolas, monospace",
      '--document-text': '#252521',
      '--document-muted': '#77766f',
      '--document-border': '#deddd7',
      '--document-accent': '#22221f',
      '--document-code-bg': '#f4f3ef',
      '--document-heading-weight': '620',
      '--document-letter-spacing': '-0.025em',
    },
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Confident hierarchy for essays',
    variables: {
      '--document-font-body': "Iowan Old Style, 'Palatino Linotype', Palatino, serif",
      '--document-font-heading': "'Avenir Next Condensed', 'Arial Narrow', sans-serif",
      '--document-font-mono': "'SFMono-Regular', Consolas, monospace",
      '--document-text': '#252018',
      '--document-muted': '#766d62',
      '--document-border': '#d7cfc3',
      '--document-accent': '#9b321d',
      '--document-code-bg': '#f4efe7',
      '--document-heading-weight': '700',
      '--document-letter-spacing': '-0.035em',
    },
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Compact engineering documentation',
    variables: {
      '--document-font-body': "'IBM Plex Sans', 'Helvetica Neue', sans-serif",
      '--document-font-heading': "'IBM Plex Sans', 'Helvetica Neue', sans-serif",
      '--document-font-mono': "'JetBrains Mono', 'SFMono-Regular', monospace",
      '--document-text': '#172027',
      '--document-muted': '#64717a',
      '--document-border': '#cbd5da',
      '--document-accent': '#166078',
      '--document-code-bg': '#edf2f4',
      '--document-heading-weight': '650',
      '--document-letter-spacing': '-0.02em',
    },
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'Formal reports and research',
    variables: {
      '--document-font-body': "'Times New Roman', Times, serif",
      '--document-font-heading': "'Times New Roman', Times, serif",
      '--document-font-mono': "'Courier New', monospace",
      '--document-text': '#171717',
      '--document-muted': '#626262',
      '--document-border': '#bcbcbc',
      '--document-accent': '#1c3f67',
      '--document-code-bg': '#f5f5f5',
      '--document-heading-weight': '700',
      '--document-letter-spacing': '0',
    },
  },
  {
    id: 'manuscript',
    name: 'Manuscript',
    description: 'Warm, measured long-form reading',
    variables: {
      '--document-font-body': "Charter, 'Bitstream Charter', Georgia, serif",
      '--document-font-heading': "Charter, 'Bitstream Charter', Georgia, serif",
      '--document-font-mono': "'SFMono-Regular', monospace",
      '--document-text': '#27241f',
      '--document-muted': '#7b7368',
      '--document-border': '#d8d1c6',
      '--document-accent': '#785535',
      '--document-code-bg': '#f5f1ea',
      '--document-heading-weight': '600',
      '--document-letter-spacing': '-0.015em',
    },
  },
  {
    id: 'mono',
    name: 'Mono',
    description: 'A disciplined terminal-inspired page',
    variables: {
      '--document-font-body': "'SFMono-Regular', 'JetBrains Mono', Consolas, monospace",
      '--document-font-heading': "'SFMono-Regular', 'JetBrains Mono', Consolas, monospace",
      '--document-font-mono': "'SFMono-Regular', 'JetBrains Mono', Consolas, monospace",
      '--document-text': '#18201c',
      '--document-muted': '#647069',
      '--document-border': '#bfc8c1',
      '--document-accent': '#236344',
      '--document-code-bg': '#edf2ee',
      '--document-heading-weight': '700',
      '--document-letter-spacing': '-0.025em',
    },
  },
]

export const getTheme = (id: ThemeId) => documentThemes.find((theme) => theme.id === id) ?? documentThemes[0]
