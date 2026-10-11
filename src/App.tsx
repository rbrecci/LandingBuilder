import { Fragment } from 'react'
import type { Content } from './content/schema.ts'
import { Header } from './components/layout/Header.tsx'
import { Footer } from './components/layout/Footer.tsx'
import { renderSection } from './sections/registry.ts'

export function App({ content }: { content: Content }) {
  const enabledSections = content.sections.filter((section) => section.enabled)

  return (
    <>
      {content.site.demoBanner.enabled && (
        <div className="demo-banner">{content.site.demoBanner.text}</div>
      )}
      <Header brand={content.brand} sections={content.sections} />
      <main id="conteudo" tabIndex={-1}>
        {enabledSections.map((section, index) => (
          <Fragment key={section.id}>
            {renderSection(section, index + 1, enabledSections.length, content)}
          </Fragment>
        ))}
      </main>
      <Footer brand={content.brand} business={content.business} footer={content.footer} />
    </>
  )
}
