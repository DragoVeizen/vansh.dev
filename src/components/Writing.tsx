import { Section } from "@/components/Section";

export function Writing() {
  return (
    <Section id="writing" label="Writing">
      <ul>
        <li>
          <article>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
              Upcoming · May 2026
            </div>
            <h3 className="mt-2 text-base font-medium leading-snug text-fg-strong">
              Rebuilding Hudle&rsquo;s payment pipeline without downtime
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              A 9-table entity split, dual-write, and middleware-rebinding — how
              we replaced a monolithic payment schema in production with
              feature flags and zero customer impact.
            </p>
          </article>
        </li>
      </ul>
    </Section>
  );
}
