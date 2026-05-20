import { Card } from "@/components/Card";
import { ResumeIcon } from "@/components/icons";

// Recruiter-only CTA. Sits between About and Experience on the homepage.
// Mounted in src/app/page.tsx wrapped in <div className="recruiter-only">.
export function Resume() {
  return (
    <section className="-mt-4 mb-4 lg:mt-0 lg:mb-0 lg:py-6">
      <Card
        href="/resume.pdf"
        external
        icon={<ResumeIcon className="h-5 w-5" />}
        label="PDF · 1 page"
        title="Résumé"
        description="Recent work: payments, search, platform tooling. Updated May 2026."
        highlight
      />
    </section>
  );
}
