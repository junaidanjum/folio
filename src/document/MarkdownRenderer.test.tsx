import { render, screen } from '@testing-library/react'
import { MarkdownRenderer } from './MarkdownRenderer'

vi.mock('./CodeBlock', () => ({ CodeBlock: ({ code }: { code: string }) => <pre>{code}</pre> }))
vi.mock('./MermaidDiagram', () => ({ MermaidDiagram: ({ source }: { source: string }) => <div>{source}</div> }))

describe('MarkdownRenderer', () => {
  it.each(['ts', ''])('renders a %s code fence without nested pre elements', (language) => {
    const { container } = render(<MarkdownRenderer content={`\`\`\`${language}\nconst value = 1\n\`\`\``} documentPath={null} showCodeLabels />)
    expect(container.querySelectorAll('pre')).toHaveLength(1)
    expect(container.querySelector('pre pre')).toBeNull()
    expect(container.querySelector('pre')).toHaveTextContent('const value = 1')
  })

  it('renders callouts without exposing their Markdown marker', () => {
    const { container } = render(<MarkdownRenderer content={'> [!NOTE]\n> Preserve the user’s work.'} documentPath={null} showCodeLabels />)

    expect(screen.getByText('note')).toBeVisible()
    expect(screen.getByText('Preserve the user’s work.')).toBeVisible()
    expect(container).not.toHaveTextContent('[!NOTE]')
    expect(container.querySelector('.callout-note')).toBeInTheDocument()
  })

  it('keeps ordinary blockquotes unchanged', () => {
    const { container } = render(<MarkdownRenderer content={'> A regular quotation.'} documentPath={null} showCodeLabels />)

    expect(screen.getByText('A regular quotation.')).toBeVisible()
    expect(container.querySelector('.callout')).not.toBeInTheDocument()
  })

  it('renders image alternatives and preserves relative browser sources', () => {
    render(<MarkdownRenderer content="![Architecture](./images/architecture.svg)" documentPath={null} showCodeLabels />)

    expect(screen.getByRole('img', { name: 'Architecture' })).toHaveAttribute('src', './images/architecture.svg')
  })

  it('removes inline styles from raw Markdown HTML', () => {
    const { container } = render(
      <MarkdownRenderer content={'<span style="position:fixed;color:red">Safe text</span>'} documentPath={null} showCodeLabels />,
    )

    expect(screen.getByText('Safe text')).toBeVisible()
    expect(container.querySelector('span')).not.toHaveAttribute('style')
  })
})
