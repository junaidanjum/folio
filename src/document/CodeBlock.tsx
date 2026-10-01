import { useEffect, useState } from 'react'

type CodeBlockProps = {
  code: string
  language: string
  showLabel: boolean
}

const supportedLanguages = new Set([
  'typescript',
  'ts',
  'javascript',
  'js',
  'jsx',
  'tsx',
  'html',
  'css',
  'json',
  'bash',
  'shell',
  'python',
  'rust',
  'go',
  'sql',
  'yaml',
  'markdown',
  'md',
])

export const CodeBlock = ({ code, language, showLabel }: CodeBlockProps) => {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const highlight = async () => {
      try {
        const { codeToHtml } = await import('shiki')
        const rendered = await codeToHtml(code, {
          lang: supportedLanguages.has(language) ? language : 'text',
          theme: 'github-light',
        })
        if (active) setHtml(rendered)
      } catch {
        if (active) setHtml(null)
      }
    }

    void highlight()
    return () => {
      active = false
    }
  }, [code, language])

  return (
    <figure className="code-block" data-language={language || 'text'}>
      {showLabel && language ? <figcaption>{language}</figcaption> : null}
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre>
          <code>{code}</code>
        </pre>
      )}
    </figure>
  )
}
