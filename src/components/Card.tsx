import Link from "next/link";
import type { ReactNode } from "react";

type CardProps = {
  href?: string;
  external?: boolean;
  icon?: ReactNode;
  label?: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
  highlight?: boolean;
};

export function Card({
  href,
  external,
  icon,
  label,
  title,
  description,
  children,
  highlight,
}: CardProps) {
  const cardClass = [
    "group relative block h-full rounded-md border p-5 transition-colors",
    highlight
      ? "border-accent/60 bg-accent/[0.04]"
      : "border-rule bg-surface/30",
    href ? "hover:border-accent/50" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const titleClass = [
    "mt-1 text-base font-medium leading-snug transition-colors",
    highlight ? "text-accent" : "text-fg-strong",
    href ? "group-hover:text-accent" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      {icon && (
        <div className="text-accent" aria-hidden>
          {icon}
        </div>
      )}
      {label && (
        <div
          className={[
            icon ? "mt-3" : "",
            "font-mono text-[10px] uppercase tracking-[0.22em] text-dim",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {label}
        </div>
      )}
      <h3 className={titleClass}>{title}</h3>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </>
  );

  if (!href) return <article className={cardClass}>{inner}</article>;
  if (external)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cardClass}>
        {inner}
      </a>
    );
  return (
    <Link href={href} className={cardClass}>
      {inner}
    </Link>
  );
}
