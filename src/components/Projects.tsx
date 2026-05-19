import type { ReactNode } from "react";
import { Card } from "@/components/Card";
import { Section } from "@/components/Section";
import { Tag } from "@/components/Tag";
import {
  DiamondIcon,
  GridIcon,
  PipelineIcon,
  PulseIcon,
  TerminalIcon,
} from "@/components/icons";
import { projects, type ProjectIconKey } from "@/data/projects";

const iconMap: Record<ProjectIconKey, ReactNode> = {
  pipeline: <PipelineIcon className="h-5 w-5" />,
  grid: <GridIcon className="h-5 w-5" />,
  pulse: <PulseIcon className="h-5 w-5" />,
  terminal: <TerminalIcon className="h-5 w-5" />,
  diamond: <DiamondIcon className="h-5 w-5" />,
};

export function Projects() {
  return (
    <Section id="projects" label="Projects">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {projects.map((p) => {
          const external = !!p.url?.startsWith("http");
          return (
            <li key={p.title}>
              <Card
                href={p.url}
                external={external}
                icon={iconMap[p.iconKey]}
                label={p.status}
                title={p.title}
                description={p.description}
              >
                {p.tags && (
                  <ul className="flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </ul>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
