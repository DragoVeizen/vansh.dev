import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Sidebar } from "@/components/Sidebar";
import { Writing } from "@/components/Writing";

export default function Home() {
  return (
    <div className="mx-auto min-h-screen max-w-screen-xl px-6 py-12 md:px-12 md:py-20 lg:px-24 lg:py-0">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <div className="lg:flex lg:justify-between lg:gap-4">
        <Sidebar />
        <main id="content" className="pt-24 lg:w-1/2 lg:py-24">
          <About />
          <Experience />
          <Projects />
          <Writing />
        </main>
      </div>
    </div>
  );
}
