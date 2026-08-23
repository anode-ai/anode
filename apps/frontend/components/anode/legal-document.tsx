import Link from "next/link"
import type { LegalDoc } from "@/lib/legal-content"

/** Renders a legal document using the site's numbered-section layout. */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  const other = doc.slug === "privacy" ? { href: "/terms", label: "Terms of Service" } : { href: "/privacy", label: "Privacy Policy" }

  return (
    <article className="relative py-24 pl-6 pr-6 md:py-32 md:pl-28 md:pr-12">
      <header className="mb-16 max-w-3xl">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">{doc.eyebrow}</span>
        <h1 className="mt-4 font-[family-name:var(--font-bebas)] text-5xl tracking-tight md:text-7xl">{doc.title}</h1>
        <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">{doc.summary}</p>
        <p className="mt-6 border-l-2 border-accent pl-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Last updated {doc.updated}
        </p>
      </header>

      <div className="max-w-3xl">
        {doc.sections.map((section, index) => (
          <section
            key={section.heading}
            className="border-t border-border/40 py-8 first:border-t-0 first:pt-0 md:py-10"
          >
            <div className="flex flex-col gap-2 md:flex-row md:gap-8">
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 md:w-12 md:pt-1">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0 flex-1">
                <h2 className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-foreground md:text-3xl">
                  {section.heading}
                </h2>

                {section.body.map((paragraph) => (
                  <p key={paragraph} className="mt-4 font-mono text-sm leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}

                {section.bullets && (
                  <ul className="mt-4 flex flex-col gap-3">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 font-mono text-sm leading-relaxed text-muted-foreground">
                        <span className="mt-2 h-1 w-1 shrink-0 bg-accent" aria-hidden="true" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-16 flex max-w-3xl flex-wrap items-center gap-x-8 gap-y-3 border-t border-border/40 pt-8">
        <Link
          href={other.href}
          className="font-mono text-xs uppercase tracking-widest text-foreground transition-colors duration-200 hover:text-accent"
        >
          {other.label}
        </Link>
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors duration-200 hover:text-accent"
        >
          Back to site
        </Link>
      </footer>
    </article>
  )
}
