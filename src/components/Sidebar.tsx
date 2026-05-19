import { nav, site } from "@/lib/site";
import { StatusLine } from "@/components/StatusLine";
import { GitHubIcon, LinkedInIcon, MailIcon } from "@/components/icons";

export function Sidebar() {
  return (
    <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-1/2 lg:flex-col lg:justify-between lg:py-24">
      <div>
        <h1 className="text-4xl font-bold leading-[1.05] tracking-[-0.025em] text-fg-strong sm:text-5xl">
          {site.name}
        </h1>
        <h2 className="mt-3 text-base font-medium tracking-tight text-fg sm:text-lg">
          {site.title}
        </h2>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
          {site.tagline}
        </p>

        <nav className="nav hidden lg:block" aria-label="In-page navigation">
          <ul className="mt-16 w-max">
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="group flex items-center py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-dim transition-colors hover:text-fg-strong focus-visible:text-fg-strong"
                >
                  <span
                    aria-hidden
                    className="mr-4 h-px w-8 bg-rule transition-all group-hover:w-16 group-hover:bg-fg-strong group-focus-visible:w-16 group-focus-visible:bg-fg-strong"
                  />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-12 space-y-6 lg:mt-0">
        <StatusLine />
        <ul className="flex items-center gap-5" aria-label="Social links">
          <li>
            <a
              href={`mailto:${site.email}`}
              aria-label="Email"
              className="text-muted transition-colors hover:text-accent focus-visible:text-accent"
            >
              <MailIcon className="h-5 w-5" />
            </a>
          </li>
          <li>
            <a
              href={site.socials.github}
              aria-label="GitHub"
              target="_blank"
              rel="noreferrer"
              className="text-muted transition-colors hover:text-accent focus-visible:text-accent"
            >
              <GitHubIcon className="h-5 w-5" />
            </a>
          </li>
          <li>
            <a
              href={site.socials.linkedin}
              aria-label="LinkedIn"
              target="_blank"
              rel="noreferrer"
              className="text-muted transition-colors hover:text-accent focus-visible:text-accent"
            >
              <LinkedInIcon className="h-5 w-5" />
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
