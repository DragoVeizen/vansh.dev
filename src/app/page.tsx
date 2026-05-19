import type { Metadata } from "next";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Sidebar } from "@/components/Sidebar";
import { Writing } from "@/components/Writing";

// Canonicalize ?mode=play to the bare homepage so the play variant
// doesn't split-rank with recruiter mode in search. The TopBar lives
// in layout.tsx; we still control the page's own metadata here.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="mx-auto min-h-screen max-w-screen-xl px-6 py-12 md:px-12 md:py-16 lg:px-24 lg:py-0">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <div className="lg:flex lg:justify-between lg:gap-4">
        <Sidebar />
        <main id="content" className="pt-16 lg:w-1/2 lg:py-16">
          <About />
          <div className="recruiter-only">
            <Experience />
          </div>
          <div className="recruiter-only">
            <Projects />
          </div>
          <Writing />
        </main>
      </div>
    </div>
  );
}
