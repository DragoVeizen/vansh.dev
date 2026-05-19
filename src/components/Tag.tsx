import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-full bg-accent-soft px-3 py-1 font-mono text-[11px] leading-5 text-accent">
      {children}
    </li>
  );
}
