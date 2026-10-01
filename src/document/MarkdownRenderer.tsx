import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { Callout } from './Callout'
import { getCalloutType } from './callout-utils'
import { CodeBlock } from './CodeBlock'
import { LocalImage } from './LocalImage'
import { MermaidDiagram } from './MermaidDiagram'

type MarkdownRendererProps = {
  content: string
  documentPath: string | null
  showCodeLabels: boolean
}

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ['className']],
    span: [...(defaultSchema.attributes?.span ?? []), ['className']],
  },
}

export const MarkdownRenderer = ({ content, documentPath, showCodeLabels }: MarkdownRendererProps) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm, remarkMath]}
    rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeKatex]}
    components={{
      code: ({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) => {
        const language = /language-([^ ]+)/.exec(className ?? '')?.[1] ?? ''
        const code = String(children).replace(/\n$/, '')
        if (language === 'mermaid') return <MermaidDiagram source={code} />
        if (className) return <CodeBlock code={code} language={language} showLabel={showCodeLabels} />
        return <code {...props}>{children}</code>
      },
      img: ({ src, alt }) => <LocalImage source={src ?? ''} alt={alt ?? ''} documentPath={documentPath} />,
      blockquote: ({ children }) => {
        const type = getCalloutType(children)
        return type ? <Callout type={type}>{children}</Callout> : <blockquote>{children}</blockquote>
      },
      a: ({ href, children, ...props }) => (
        <a href={href} rel="noreferrer" {...props}>
          {children}
        </a>
      ),
    }}
  >
    {content}
  </ReactMarkdown>
)
