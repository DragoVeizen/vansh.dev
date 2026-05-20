import { Section } from "@/components/Section";

const HL = ({ children }: { children: string }) => (
  <span className="text-accent">{children}</span>
);

export function About() {
  return (
    <Section id="about" label="About">
      <p className="max-w-[58ch] font-mono text-base leading-[1.9] text-fg sm:text-[17px] sm:leading-[2]">
        {"I build the backend systems behind "}
        <HL>Hudle</HL>
        {"’s payments and search — most recently a "}
        <HL>9-table entity-split</HL>
        {" of the payment pipeline, rolled out behind a feature flag with zero downtime. I tend to optimize for the things that don’t make demos: idempotency, observability, getting onboarding under an hour. I write about the parts that don’t have "}
        <HL>good answers on the internet yet</HL>
        {"."}
      </p>
    </Section>
  );
}
