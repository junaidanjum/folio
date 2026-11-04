import { useEffect, useId, useState } from 'react'

type MermaidDiagramProps = { source: string }

export const MermaidDiagram = ({ source }: MermaidDiagramProps) => {
  const reactId = useId().replace(/:/g, '')
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const render = async () => {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral', fontFamily: 'inherit' })
        const result = await mermaid.render(`folio-mermaid-${reactId}`, source)
        if (active) setSvg(result.svg)
      } catch {
        if (active) setError('This diagram could not be rendered.')
      }
    }

    void render()
    return () => {
      active = false
    }
  }, [reactId, source])

  if (error) return <div className="render-fallback">{error}</div>
  if (!svg) return <div className="diagram-loading">Rendering diagram…</div>
  return <div className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: svg }} />
}
