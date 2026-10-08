import { useState, type CSSProperties } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Code2, FileText, Github, Layers2, LockKeyhole, Monitor, Printer, RefreshCw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { documentThemes } from '../document/themes'

const repository = 'https://github.com/junaidanjum/folio'
const alphaRelease = `${repository}/releases/tag/alpha`
const alphaGuide = `${repository}/blob/main/docs/alpha-release.md`
const sample = `# A little room to think

Notes on making things that matter.

## Less noise. More meaning.

The best ideas rarely arrive fully formed. They start as a few words, a rough outline, a thought worth keeping.

Good tools give those ideas room to breathe. A little structure. A considered typeface. Space in all the right places.

> The way we present an idea is part of the idea itself.

## A few things worth keeping

- Start with the words.
- Give every detail a purpose.
- Leave a little room in the margins.

---

Made with intention. Ready to share.`

const questions = [
  [
    'Is Folio a Markdown editor?',
    'Folio is the finishing step. Write in your favorite editor, then open the Markdown file in Folio to style, preview, and print it. The desktop app reloads your document when you save changes in your editor.',
  ],
  [
    'Does my writing leave my device?',
    'Your local documents stay on your device. Folio renders them locally, with no account or document upload required. Remote images are blocked; supported local images can be loaded from the document’s folder.',
  ],
  [
    'What can I put in a document?',
    'Alongside standard Markdown, Folio supports tables, syntax-highlighted code, Mermaid diagrams, math, and local PNG, JPEG, GIF, and WebP images. Long text, lists, code, and tables can flow across physical pages.',
  ],
  [
    'How do I save a PDF?',
    'In the macOS app, choose Export PDF, then use Save as PDF in the native print dialog. You can also send the document directly to a printer.',
  ],
  [
    'Can I use it today?',
    'Folio is an open-source macOS alpha. Download the universal Apple Silicon and Intel installer, or build from source. The alpha is ad-hoc signed, but is not Developer ID signed or notarized. See the build guide for current limitations.',
  ],
]

function Brand() {
  return (
    <span className="brand">
      <span className="brand-icon" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      folio<span className="brand-period">.</span>
    </span>
  )
}

export function LandingPage() {
  const [themeIndex, setThemeIndex] = useState(1)
  const [markdown, setMarkdown] = useState(sample)
  const theme = documentThemes[themeIndex]

  return (
    <div className="landing">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a href="#" aria-label="Folio home">
          <Brand />
        </a>
        <nav aria-label="Main navigation">
          <a href="#details">Why Folio</a>
          <a href="#playground">The little details</a>
          <a href="#questions">FAQs</a>
        </nav>
        <a className="button button-small" href="#get-folio">
          Get Folio <ArrowUpRight size={15} />
        </a>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <a className="announcement" href="#get-folio">
              <span /> A small app. A considered finish. <ArrowRight size={13} />
            </a>
            <h1 id="hero-title">
              Good words deserve
              <br />a <em>beautiful page.</em>
            </h1>
            <p>
              Your Markdown, thoughtfully dressed for the real world.
              <br className="desktop-break" /> Style it. Preview it. Put it on paper.
            </p>
            <div className="hero-actions">
              <a className="button" href="#get-folio">
                <Monitor size={17} /> Get Folio for Mac <ArrowUpRight size={16} />
              </a>
              <a className="text-link" href="#playground">
                See it in action <ArrowDown size={15} />
              </a>
            </div>
            <p className="hero-note">Local-first. Open source. Uncomplicated.</p>
          </div>
          <div className="hero-art" aria-label="Markdown transformed into a beautifully typeset document">
            <div className="source-card">
              <div className="mini-toolbar">
                <span className="window-dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span>a-little-room.md</span>
                <Code2 size={13} />
              </div>
              <div className="source-lines">
                <span className="code-muted">01</span>
                <b># A little room to think</b>
                <span className="code-muted">02</span>
                <span />
                <span className="code-muted">03</span>
                <span>Notes on making things that matter.</span>
                <span className="code-muted">04</span>
                <span />
                <span className="code-muted">05</span>
                <b>## Less noise. More meaning.</b>
                <span className="code-muted">06</span>
                <span />
                <span className="code-muted">07</span>
                <span>The best ideas rarely arrive fully</span>
                <span className="code-muted">08</span>
                <span>formed. They start as a few words,</span>
                <span className="code-muted">09</span>
                <span>a thought worth keeping.</span>
                <span className="code-muted">10</span>
                <span />
                <span className="code-muted">11</span>
                <span>&gt; Give your ideas room to breathe.</span>
              </div>
              <div className="source-footer">
                <span>Markdown</span>
                <span>Just your words.</span>
              </div>
            </div>
            <span className="transformation" aria-hidden="true">
              <ArrowRight size={23} />
            </span>
            <div className="paper-stack">
              <div className="hero-paper">
                <div className="paper-running">
                  <span>FIELD NOTES</span>
                  <span>NO. 001</span>
                </div>
                <h2>
                  A little room
                  <br />
                  to think.
                </h2>
                <p className="paper-deck">Notes on making things that matter.</p>
                <div className="paper-rule" />
                <h3>Less noise. More meaning.</h3>
                <p>The best ideas rarely arrive fully formed. They start as a few words, a rough outline, a thought worth keeping.</p>
                <p>Good tools give those ideas room to breathe. A little structure. A considered typeface. Space in all the right places.</p>
                <blockquote>
                  “The way we present an idea
                  <br />
                  is part of the idea itself.”
                </blockquote>
                <div className="paper-bottom">
                  <span>MADE WITH INTENTION</span>
                  <span>01</span>
                </div>
              </div>
            </div>
            <span className="art-caption caption-left">Plain text in.</span>
            <span className="art-caption caption-right">A little more considered, out.</span>
            <span className="ready-tag">
              <Check size={13} /> Ready for paper
            </span>
          </div>
        </section>

        <div className="proof-strip">
          <span>
            <LockKeyhole /> On your device. Always.
          </span>
          <span>
            <FileText /> Real pages, not an endless scroll.
          </span>
          <span>
            <Code2 /> Your Markdown stays yours.
          </span>
        </div>

        <section id="details" className="section details">
          <div className="section-heading">
            <span className="eyebrow">THE LAST MILE FOR YOUR WORDS</span>
            <h2>
              From a file you wrote.
              <br />
              To something you’re proud to share.
            </h2>
            <p>You’ve done the thinking. Folio takes care of the finishing.</p>
          </div>
          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-label">
                <Layers2 size={16} /> A real sense of the page
              </span>
              <h3>
                Know where
                <br />
                every word lands.
              </h3>
              <p>A4 or Letter. Portrait or landscape. See real page breaks and considered margins before you ever hit print.</p>
              <div className="pagination-art" aria-hidden="true">
                <div className="tiny-paper">
                  <span>THE SHAPE OF AN IDEA</span>
                  <b>Room to breathe.</b>
                  <i />
                  <i />
                  <i />
                  <i />
                  <div className="tiny-quote">
                    A little space makes
                    <br />
                    all the difference.
                  </div>
                  <i />
                  <i />
                  <small>01</small>
                </div>
                <div className="tiny-paper second">
                  <span>THE SHAPE OF AN IDEA</span>
                  <b>On the next page.</b>
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <small>02</small>
                </div>
                <span className="page-tag">A4 · 210 × 297 mm</span>
              </div>
            </article>
            <article className="feature-card">
              <span className="feature-label">
                <RefreshCw size={16} /> Fits into your flow
              </span>
              <h3>
                Your editor.
                <br />A new perspective.
              </h3>
              <p>Keep writing where you’re comfortable. Save your file and Folio reloads it. Your words, with their best foot forward.</p>
              <div className="workflow-art" aria-hidden="true">
                <div className="file-tile">
                  <Code2 size={31} />
                  <span>your-ideas.md</span>
                </div>
                <div className="sync-line">
                  <span />
                  <RefreshCw size={18} />
                  <span />
                </div>
                <div className="folio-tile">
                  <Brand />
                </div>
                <div className="saved-note">
                  <span /> Saved in your editor. Refreshed in Folio.
                </div>
              </div>
            </article>
          </div>
          <div className="small-features">
            <article>
              <Code2 />
              <h3>More than paragraphs.</h3>
              <p>Code, tables, math, and Mermaid diagrams. The substance stays intact.</p>
            </article>
            <article>
              <LockKeyhole />
              <h3>A private little workspace.</h3>
              <p>No account. No uploading your draft. Just your files, on your device.</p>
            </article>
            <article>
              <Printer />
              <h3>Ready for the next chapter.</h3>
              <p>Print a copy or save a PDF through the familiar macOS print dialog.</p>
            </article>
          </div>
        </section>

        <section id="playground" className="section playground">
          <div className="section-heading">
            <span className="eyebrow">SAME WORDS. DIFFERENT FEELING.</span>
            <h2>
              A change of type.
              <br />A whole new tone.
            </h2>
            <p>Six considered themes. Find the one that sounds like you.</p>
          </div>
          <div className="theme-picker" role="group" aria-label="Document theme">
            {documentThemes.map((item, index) => (
              <button key={item.id} type="button" aria-pressed={index === themeIndex} onClick={() => setThemeIndex(index)}>
                {item.name}
              </button>
            ))}
          </div>
          <div className="demo-window">
            <div className="demo-toolbar">
              <span>
                <FileText size={14} /> a-little-room.md
              </span>
              <span className="demo-live">
                <span /> Interactive preview
              </span>
            </div>
            <div className="demo-columns">
              <div className="demo-source">
                <div className="demo-label">
                  <label htmlFor="markdown-sample">YOUR MARKDOWN</label>
                  <button type="button" onClick={() => setMarkdown(sample)}>
                    Reset sample <RefreshCw size={12} />
                  </button>
                </div>
                <textarea
                  id="markdown-sample"
                  spellCheck={false}
                  value={markdown}
                  onChange={(event) => setMarkdown(event.target.value)}
                  maxLength={12000}
                  aria-describedby="demo-help"
                />
              </div>
              <div className="demo-preview">
                <div className="demo-label">
                  <span>THE FOLIO FEELING</span>
                  <span>{theme.name}</span>
                </div>
                <div className="demo-paper" style={theme.variables as CSSProperties}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
                    {markdown}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
          <p className="demo-help" id="demo-help">
            Go on, change a few words. This sample stays in your browser.
            <br />
            Full pagination and print controls live in the Mac app.
          </p>
        </section>

        <section className="section steps">
          <div className="section-heading">
            <span className="eyebrow">LESS FIDDLING. MORE FINISHING.</span>
            <h2>Three steps. Then it’s real.</h2>
          </div>
          <div className="steps-grid">
            <article>
              <span className="step-number">01</span>
              <h3>Bring your words.</h3>
              <p>Open a Markdown file, or drop it right into Folio.</p>
            </article>
            <article>
              <span className="step-number">02</span>
              <h3>Make it feel right.</h3>
              <p>Pick a theme. Adjust the type, margins, and paper.</p>
            </article>
            <article>
              <span className="step-number">03</span>
              <h3>Send it into the world.</h3>
              <p>Preview the pages. Print or save a PDF. That’s it.</p>
            </article>
          </div>
        </section>

        <section id="questions" className="section faq">
          <div className="section-heading">
            <span className="eyebrow">A FEW MORE WORDS</span>
            <h2>Glad you asked.</h2>
          </div>
          <div className="faq-list">
            {questions.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="get-folio" className="get-folio">
          <span className="closing-icon" aria-hidden="true">
            <FileText size={33} strokeWidth={1.2} />
          </span>
          <span className="eyebrow">A SMALL APP FOR THE FINISHING TOUCH</span>
          <h2>
            Let’s give your words
            <br />
            somewhere to land.
          </h2>
          <p>Made for Mac. Built around your Markdown.</p>
          <div className="closing-actions">
            <a href={alphaRelease} className="button">
              <Monitor size={17} /> Get the macOS alpha <ArrowUpRight size={16} />
            </a>
            <a href={repository} className="text-link">
              <Github size={17} /> Explore the source <ArrowUpRight size={14} />
            </a>
          </div>
          <p className="alpha-note">
            alpha · Apple Silicon + Intel · MIT licensed
            <br />
            Ad-hoc signed. Not Developer ID signed or notarized.
          </p>
        </section>
      </main>
      <footer className="site-footer">
        <a href="#" aria-label="Folio home">
          <Brand />
        </a>
        <p>A considered finish for your words.</p>
        <div>
          <a href={repository}>
            GitHub <ArrowUpRight size={12} />
          </a>
          <a href={alphaGuide}>
            Alpha guide <ArrowUpRight size={12} />
          </a>
          <span>Made by Junaid Anjum</span>
        </div>
      </footer>
    </div>
  )
}
