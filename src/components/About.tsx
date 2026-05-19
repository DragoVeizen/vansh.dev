import { Section } from "@/components/Section";

const linkClass =
  "text-fg-strong underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:decoration-accent focus-visible:decoration-accent";

export function About() {
  return (
    <Section id="about" label="About">
      <div className="space-y-4 leading-relaxed text-muted">
        <p>
          I&rsquo;m Vansh, a full stack engineer based in New Delhi. I lean backend
          — most of my work lives in PHP/Laravel, Go, and the messier parts of MySQL.
        </p>
        <p>
          At{" "}
          <a href="https://hudle.in" className={linkClass} target="_blank" rel="noreferrer">
            Hudle
          </a>
          , India&rsquo;s largest sports venue booking platform, I rebuilt our
          payment pipeline — splitting a monolithic single-record schema into a
          9-table entity model with rank-based refund ordering, rolled out
          behind a feature flag with zero downtime. I shipped insurance as a
          new revenue stream, rewrote our search pipeline on Elasticsearch, and
          built our primary acquisition surface,{" "}
          <a href="https://hudle.in" className={linkClass} target="_blank" rel="noreferrer">
            hudle.in
          </a>
          .
        </p>
        <p>
          Outside work, I&rsquo;m building{" "}
          <a
            href="https://keylytics-web.onrender.com/"
            className={linkClass}
            target="_blank"
            rel="noreferrer"
          >
            Keylytics
          </a>
          , a keystroke telemetry analytics tool. I&rsquo;m drawn to systems that
          handle messy real-world state — payments, search, and the kind of
          infrastructure that decides whether a company can ship fast.
        </p>
      </div>
    </Section>
  );
}
