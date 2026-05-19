import { Section } from "@/components/Section";
import { Tag } from "@/components/Tag";
import { experience, type ExperienceItem } from "@/data/experience";

function ExperienceEntry({
  entry,
  isCurrent,
}: {
  entry: ExperienceItem;
  isCurrent: boolean;
}) {
  return (
    <article className="relative pl-7">
      <span
        aria-hidden
        className={
          isCurrent
            ? "absolute -left-[4px] top-2 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-bg shadow-[0_0_14px_var(--color-accent)]"
            : "absolute -left-[2px] top-[10px] h-1.5 w-1.5 rounded-full bg-rule ring-4 ring-bg"
        }
      />
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
        {entry.dateRange}
      </div>
      <h3 className="mt-2 text-base font-medium leading-snug text-fg-strong">
        <a
          href={entry.companyUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-baseline gap-1.5 transition-colors hover:text-accent focus-visible:text-accent"
        >
          <span>{entry.role}</span>
          <span className="text-dim">·</span>
          <span>{entry.company}</span>
        </a>
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{entry.description}</p>
      {entry.outcomes && entry.outcomes.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-sm text-muted">
          {entry.outcomes.map((outcome) => (
            <li key={outcome} className="flex gap-2.5">
              <span aria-hidden className="mt-1 text-accent">
                →
              </span>
              <span>{outcome}</span>
            </li>
          ))}
        </ul>
      )}
      {entry.tags && entry.tags.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </ul>
      )}
    </article>
  );
}

export function Experience() {
  return (
    <Section id="experience" label="Experience">
      <ol className="group/list relative">
        <span
          aria-hidden
          className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-accent/50 via-rule to-rule"
        />
        {experience.map((entry, idx) => (
          <li
            key={entry.company + entry.dateRange}
            className={[
              idx > 0 ? "mt-14" : "",
              "transition-opacity duration-200",
              "lg:group-hover/list:opacity-50 lg:hover:opacity-100",
            ].join(" ")}
          >
            <ExperienceEntry entry={entry} isCurrent={idx === 0} />
          </li>
        ))}
      </ol>
    </Section>
  );
}
