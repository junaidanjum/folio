export type ThemeId = 'minimal' | 'editorial' | 'technical' | 'academic' | 'manuscript' | 'mono'
export type PaperSize = 'a4' | 'letter'
export type Orientation = 'portrait' | 'landscape'
export type MarginPreset = 'narrow' | 'normal' | 'wide'

export type Frontmatter = {
  title?: string
  subtitle?: string
  author?: string
  date?: string
}

export type OpenDocument = {
  name: string
  path: string | null
  content: string
  frontmatter: Frontmatter
}

export type DocumentSettings = {
  theme: ThemeId
  paperSize: PaperSize
  orientation: Orientation
  marginPreset: MarginPreset
  fontSize: number
  lineHeight: number
  paragraphSpacing: number
  zoom: number
  pageNumbers: boolean
  numberedHeadings: boolean
  printLinkUrls: boolean
  codeLabels: boolean
  printBackgrounds: boolean
  customCssEnabled: boolean
  customCss: string
}
