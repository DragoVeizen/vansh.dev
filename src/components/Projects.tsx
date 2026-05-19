import { Section } from "@/components/Section";
import { Tag } from "@/components/Tag";
import { ArrowOutIcon } from "@/components/icons";
import { projects, type ProjectItem } from "@/data/projects";

function ProjectCard({ project }: { project: ProjectItem }) {
  const isExternal = !!project.url?.startsWith("http");
  const Title = (
    <span className="inline-flex items-baseline gap-1.5">
      <span>{project.title}</span>
      {isExternal && <ArrowOutIcon className="h-3 w-3 translate-y-px" />}
    </span>
  );
  return (
    <li className="group">
      <article>
        {project.status && (
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
            {project.status}
          </span>
        )}
        <h3 className="mt-1 text-base font-medium leading-snug text-fg-strong">
          {project.url ? (
            <a
              href={project.url}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer" : undefined}
              className="transition-colors hover:text-accent focus-visible:text-accent"
            >
              {Title}
            </a>
          ) : (
            Title
          )}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{project.description}</p>
        {project.tags && project.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </ul>
        )}
      </article>
    </li>
  );
}

export function Projects() {
  return (
    <Section id="projects" label="Projects">
      <ol className="space-y-12">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </ol>
    </Section>
  );
}
