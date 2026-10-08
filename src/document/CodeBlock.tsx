import { Fragment, useEffect, useState } from 'react'

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
        const { getSingletonHighlighter, createJavaScriptRegexEngine } = await import('shiki')
        const highlighter = await getSingletonHighlighter({
          langs: [supportedLanguages.has(language) ? language : 'text'],
          themes: ['github-light'],
          engine: createJavaScriptRegexEngine(),
        })
        const rendered = highlighter.codeToHtml(code, {
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
          <code>
            {code.split('\n').map((line, index, lines) => (
              <Fragment key={index}>
                <span className="line">{line}</span>
                {index < lines.length - 1 ? '\n' : null}
              </Fragment>
            ))}
          </code>
        </pre>
      )}
    </figure>
  )
}
