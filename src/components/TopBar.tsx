// src/components/TopBar.tsx
//
// Sticky top strip. Spans full width. Holds the wordmark on the left
// and the ✦ mode toggle on the right. Server component — the only
// client part is <ModeToggle/>.

import { ModeToggle } from "@/components/ModeToggle";
import { Wordmark } from "@/components/Wordmark";

export function TopBar() {
  return (
    <header
      role="banner"
      className="sticky top-0 z-30 border-b border-rule/60 bg-bg/80 backdrop-blur"
    >
      <div className="mx-auto flex h-12 max-w-screen-xl items-center justify-between px-6 md:px-12 lg:px-24">
        <a
          href="/"
          aria-label="vansh.dev — home"
          className="transition-opacity hover:opacity-80"
        >
          <Wordmark />
        </a>
        <ModeToggle />
      </div>
    </header>
  );
}
