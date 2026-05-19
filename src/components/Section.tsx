import type { ReactNode } from "react";

export function Section({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={label}
      className="scroll-mt-16 py-16 first:pt-0 lg:py-20 lg:scroll-mt-24"
    >
      <div className="sticky top-0 z-20 -mx-6 mb-10 bg-bg/80 px-6 py-4 backdrop-blur md:-mx-12 md:px-12 lg:static lg:mx-0 lg:mb-8 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
          {label}
        </h2>
      </div>
      {children}
    </section>
  );
}
