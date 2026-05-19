// src/components/Wordmark.tsx
//
// The vansh.dev wordmark used in the top bar. `vansh` stays sans
// (Geist), `.dev` is always italic serif — that's the editorial
// signature from the spec, regardless of mode. The `.dev` color
// follows --color-accent, so it retints automatically with the mode.

export function Wordmark() {
  return (
    <span className="inline-flex items-baseline text-base font-semibold tracking-[-0.018em] text-fg-strong sm:text-[17px]">
      <span>vansh</span>
      <span
        className="text-accent"
        // Inline style because tailwind v4 doesn't expose
        // arbitrary font-family utilities for our --font-serif var
        // without a custom utility. One-off; cheap to inline.
        style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 500 }}
      >
        .dev
      </span>
    </span>
  );
}
