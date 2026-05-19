import { Section } from "@/components/Section";

const HL = ({ children }: { children: string }) => (
  <span className="text-accent">{children}</span>
);

export function About() {
  return (
    <Section id="about" label="About">
      <div className="rounded-md border border-rule bg-surface/30 p-6 sm:p-8">
        <p className="font-mono text-base leading-[1.9] text-fg sm:text-[17px] sm:leading-[2]">
          {"I love "}
          <HL>building stuff</HL>
          {
            " that solves for some problem X after I visualize myself as the one dealing with it, then finding the best way (and if it’s even needed) to help "
          }
          <HL>“myself”</HL>
          {" out. No, it’s not all for me — I like to help other people out as well (sometimes). I also love to talk about "}
          <HL>weird products</HL>
          {" that have stories behind them and anecdotal solutions."}
        </p>
      </div>
    </Section>
  );
}
