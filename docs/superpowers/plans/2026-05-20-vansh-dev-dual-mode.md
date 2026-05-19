# vansh.dev Dual-Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Phase 1 of the dual-mode redesign for vansh.dev — a recruiter/play toggle with a ✦ button in a new top bar, mode persistence via `localStorage`, and a shareable `?mode=play` URL.

**Architecture:** Mode lives on `<html data-mode="recruiter|play">`. An inline `<script>` in `<head>` sets the attribute before paint (no FOUC). One client component (the ✦ button) writes mode; every other consumer is a CSS attribute selector. Two text variants for mode-dependent copy render side-by-side; CSS hides the inactive one. No React context, no provider, no `useMode()` hook consumed by components.

**Tech Stack:** Next.js 16, React 19, Tailwind v4 (with `@theme inline` custom properties), TypeScript, MDX via `next-mdx-remote`.

**Spec:** `docs/superpowers/specs/2026-05-20-vansh-dev-dual-mode-design.md`

---

## Pre-flight notes

- **No automated test framework exists** in this repo. Do not add one. Verification uses `node -e` for pure-function checks (mode.ts) and a scripted manual checklist in the browser for presentational changes. The spec explicitly accepted this approach.
- **Commit message style:** plain, no `Co-Authored-By` trailer (per user preference saved in session memory). Short imperative subject lines.
- **`pnpm`** is the package manager. Use `pnpm dev` to run the dev server, `pnpm build` to typecheck + build, `pnpm lint` for ESLint.
- **Dev server URL:** `http://localhost:3000`. Verify renders before and after each task that touches visible markup.
- **Accent colors locked in spec:** recruiter `#f59e0b` (current amber), play `#71d0a8` (mint teal).

---

## File structure

**New files (5):**

| Path | Responsibility |
|---|---|
| `src/lib/mode.ts` | Constants (`MODE_STORAGE_KEY`, `MODE_QUERY_PARAM`), the `Mode` type, the `isValidMode` guard, and the init-script source as a string. Pure module. |
| `src/components/ModeInitScript.tsx` | Server component. Emits an inline `<script>` via `dangerouslySetInnerHTML` that reads URL+localStorage and sets `<html data-mode>` before paint. |
| `src/components/Wordmark.tsx` | Server component. Renders `vansh.dev` with sans `vansh` + italic-serif `.dev`. |
| `src/components/ModeToggle.tsx` | `'use client'`. The ✦ button. Reads `data-mode` on mount, flips on click, writes localStorage, updates URL via `history.replaceState`. |
| `src/components/TopBar.tsx` | Server component. Sticky top strip composing `<Wordmark />` + `<ModeToggle />`. |

**Modified files (7):**

| Path | What changes |
|---|---|
| `src/app/layout.tsx` | Inject `<ModeInitScript />` in `<head>`. Add `<TopBar />` above the existing flex container. Set default `data-mode="recruiter"` on `<html>` for no-JS fallback. |
| `src/app/page.tsx` | Wrap Experience + Projects in `<div className="recruiter-only">`. Add `alternates.canonical: '/'` metadata so `?mode=play` doesn't split-rank. |
| `src/app/globals.css` | Add `:root[data-mode="play"]` accent overrides, `--font-serif` variable, `.recruiter-only` / `.play-only` utility classes, `data-post-category` filter selectors, 250ms color transitions, `prefers-reduced-motion` overrides, body-gradient retint via `color-mix()`. |
| `src/lib/site.ts` | Add a `play` object holding the play-mode name, subtitle, tagline, currentlyDoing, nav. |
| `src/components/Sidebar.tsx` | Dual-render: both recruiter and play variants for h1, subtitle, tagline, in-page nav. CSS hides the wrong one. |
| `src/components/StatusLine.tsx` | Dual-render: both status strings; CSS hides the wrong one. |
| `src/components/Writing.tsx` | Add `data-post-category` to each `<li>`. Dual-render the section heading ("Writing" / "Notes"). Wrap the "Upcoming" placeholder card in `recruiter-only` (it's a case-study teaser). |

**Untouched files (per spec):** `About.tsx`, `Card.tsx`, `Section.tsx`, `Tag.tsx`, `icons.tsx`, `Experience.tsx`, `Projects.tsx`, `data/experience.ts`, `data/projects.ts`, `lib/posts.ts`, `app/writing/page.tsx`, `app/writing/[slug]/page.tsx`, `app/icon.tsx`, `app/opengraph-image.tsx`.

---

## Task 0: Baseline check

**Files:** none modified. This is a verification step before code changes.

- [ ] **Step 1: Confirm clean working tree**

Run: `cd /Users/mac/vansh.dev && git status`
Expected: `nothing to commit, working tree clean` (or only `.superpowers/` untracked, which is gitignored).

- [ ] **Step 2: Confirm dev server boots and homepage renders**

Run: `cd /Users/mac/vansh.dev && pnpm dev`
In a second terminal: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000`
Expected: `200`. Stop the dev server after the check (Ctrl-C); subsequent tasks will start it again as needed.

- [ ] **Step 3: Confirm baseline build passes**

Run: `cd /Users/mac/vansh.dev && pnpm build`
Expected: `✓ Compiled successfully` and no TypeScript errors. If this fails, stop and investigate before proceeding — the rest of the plan assumes a working baseline.

---

## Task 1: Create the `mode` library module

**Files:**
- Create: `src/lib/mode.ts`

This module is the single source of truth for the storage key, query-param name, mode type, validation, and the init-script source string.

- [ ] **Step 1: Write `src/lib/mode.ts`**

```ts
// src/lib/mode.ts
//
// Single source of truth for the dual-mode toggle. Used by:
//   - <ModeInitScript> (renders the inline script via INIT_SCRIPT_SOURCE)
//   - <ModeToggle>     (reads/writes the same key + param)
//   - any future consumer that needs the canonical names
//
// Mode lives on <html data-mode="recruiter|play">. localStorage persists
// explicit user choices; URL ?mode=... opens a specific mode for one load
// without persisting.

export const MODE_STORAGE_KEY = "vansh-dev-mode";
export const MODE_QUERY_PARAM = "mode";
export const MODE_VALUES = ["recruiter", "play"] as const;

export type Mode = (typeof MODE_VALUES)[number];

export function isValidMode(value: unknown): value is Mode {
  return value === "recruiter" || value === "play";
}

// The init script runs synchronously in <head>, before React hydration,
// so we get the correct data-mode before first paint. Inlined as a string
// (not a real function) because it must serialize without bundler help.
//
// Reading order matches the spec:
//   1. URL ?mode=play|recruiter wins for this load (no localStorage write)
//   2. localStorage[MODE_STORAGE_KEY] if valid
//   3. default "recruiter"
//
// Invalid values in either source fall through to the next step.
export const INIT_SCRIPT_SOURCE = `(function(){try{
var d=document.documentElement;
var u=new URL(window.location.href);
var q=u.searchParams.get(${JSON.stringify(MODE_QUERY_PARAM)});
var v=(q==='play'||q==='recruiter')?q:null;
if(!v){try{var s=localStorage.getItem(${JSON.stringify(MODE_STORAGE_KEY)});if(s==='play'||s==='recruiter')v=s;}catch(e){}}
if(!v)v='recruiter';
d.setAttribute('data-mode',v);
}catch(e){document.documentElement.setAttribute('data-mode','recruiter');}})();`;
```

- [ ] **Step 2: Verify the script source parses as valid JavaScript**

Run from the repo root:

```bash
node -e "new Function(require('./src/lib/mode.ts').INIT_SCRIPT_SOURCE)"
```

Wait — `node` can't load a `.ts` file directly. Use `tsx` (which is available via `pnpm exec`) instead, OR copy the string into a quick node check. Use this instead:

```bash
node --input-type=module -e "
import('./src/lib/mode.ts').catch(e=>{console.error('cannot import ts directly, ok');});
"
```

That still won't work because of the .ts extension. Easier: just compile-check via the existing pipeline.

Replace Step 2 with: **typecheck the new file via the build**.

Run: `pnpm exec tsc --noEmit`
Expected: no errors. (This compiles the whole project; the new `mode.ts` is type-checked along with everything else.)

- [ ] **Step 3: Verify `isValidMode` and the constants behave correctly**

Create a temporary check script `/tmp/check-mode.mjs`:

```js
// /tmp/check-mode.mjs — temporary, do not commit
const MODE_VALUES = ["recruiter", "play"];
function isValidMode(v) { return v === "recruiter" || v === "play"; }

console.assert(isValidMode("recruiter") === true, "recruiter should be valid");
console.assert(isValidMode("play") === true, "play should be valid");
console.assert(isValidMode("xyz") === false, "xyz should be invalid");
console.assert(isValidMode(null) === false, "null should be invalid");
console.assert(isValidMode(undefined) === false, "undefined should be invalid");
console.assert(MODE_VALUES.length === 2, "exactly two modes");
console.log("mode.ts logic verified");
```

Run: `node /tmp/check-mode.mjs`
Expected: `mode.ts logic verified` and no assertion failures. Delete the temp file after: `rm /tmp/check-mode.mjs`.

- [ ] **Step 4: Verify the init-script string is syntactically valid JS**

```bash
node -e "
var s = \"(function(){try{var d=document.documentElement;var u=new URL(window.location.href);var q=u.searchParams.get('mode');var v=(q==='play'||q==='recruiter')?q:null;if(!v){try{var st=localStorage.getItem('vansh-dev-mode');if(st==='play'||st==='recruiter')v=st;}catch(e){}}if(!v)v='recruiter';d.setAttribute('data-mode',v);}catch(e){document.documentElement.setAttribute('data-mode','recruiter');}})();\";
new Function(s);
console.log('init script parses');
"
```

Expected: `init script parses`. (We can't *run* it under Node because `document` doesn't exist, but `new Function(s)` will throw `SyntaxError` if the script is malformed.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/mode.ts
git commit -m "feat(mode): add mode lib with constants, type guard, and init script source"
```

---

## Task 2: Create the `ModeInitScript` component

**Files:**
- Create: `src/components/ModeInitScript.tsx`

This is a server component that emits a single `<script>` tag with the init source. It must render before any other element that depends on `data-mode` — i.e., it goes in `<head>`.

- [ ] **Step 1: Write `src/components/ModeInitScript.tsx`**

```tsx
// src/components/ModeInitScript.tsx
//
// Server component. Renders the inline mode-init script in <head>.
// This script runs synchronously before React hydration and sets
// <html data-mode="..."> based on the URL or localStorage, so we
// never flash the wrong mode on first paint.
//
// The script source lives in src/lib/mode.ts so the storage key /
// query-param names stay in one place.

import { INIT_SCRIPT_SOURCE } from "@/lib/mode";

export function ModeInitScript() {
  return (
    <script
      // Inline scripts are the standard pattern for theme-toggle
      // pre-hydration; same approach as `next-themes`. Safe because
      // the source string is a build-time constant we own.
      dangerouslySetInnerHTML={{ __html: INIT_SCRIPT_SOURCE }}
    />
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ModeInitScript.tsx
git commit -m "feat(mode): add ModeInitScript component for pre-hydration data-mode"
```

---

## Task 3: Create the `Wordmark` component

**Files:**
- Create: `src/components/Wordmark.tsx`

`vansh.dev` with `vansh` in sans (Geist) and `.dev` in italic serif. The serif lives in two places site-wide (here and the sidebar h1 in play mode); the font stack will be added as `--font-serif` in `globals.css` in Task 7.

- [ ] **Step 1: Write `src/components/Wordmark.tsx`**

```tsx
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
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors. (The `text-accent` and `text-fg-strong` classes already exist in globals.css.)

- [ ] **Step 3: Commit**

```bash
git add src/components/Wordmark.tsx
git commit -m "feat(chrome): add Wordmark component for vansh.dev with italic-serif .dev"
```

---

## Task 4: Create the `ModeToggle` component (the ✦ button)

**Files:**
- Create: `src/components/ModeToggle.tsx`

The only client component in this feature. Reads `data-mode` from `document.documentElement` on mount (already set by the init script before hydration). On click: flips the attribute, writes localStorage, updates the URL via `history.replaceState`.

- [ ] **Step 1: Write `src/components/ModeToggle.tsx`**

```tsx
"use client";

// src/components/ModeToggle.tsx
//
// The ✦ button. Single client component for the whole feature.
//
// On mount: reads <html data-mode> (the init script set it pre-paint).
// On click: flips mode, writes localStorage, updates URL via
// history.replaceState (no history entry — back button stays clean).

import { useEffect, useState } from "react";
import {
  MODE_QUERY_PARAM,
  MODE_STORAGE_KEY,
  isValidMode,
  type Mode,
} from "@/lib/mode";

export function ModeToggle() {
  const [mode, setMode] = useState<Mode>("recruiter");

  // Read the mode the init script already set. Doing this in an effect
  // (vs reading during render) keeps SSR markup deterministic.
  useEffect(() => {
    const v = document.documentElement.dataset.mode;
    if (isValidMode(v)) setMode(v);
  }, []);

  function flip() {
    const next: Mode = mode === "play" ? "recruiter" : "play";

    document.documentElement.setAttribute("data-mode", next);
    try {
      localStorage.setItem(MODE_STORAGE_KEY, next);
    } catch {
      // localStorage may be unavailable (Safari private mode, quota).
      // Mode still works for this session via the DOM attribute.
    }

    const url = new URL(window.location.href);
    if (next === "play") {
      url.searchParams.set(MODE_QUERY_PARAM, "play");
    } else {
      url.searchParams.delete(MODE_QUERY_PARAM);
    }
    window.history.replaceState(null, "", url.toString());

    setMode(next);
  }

  const isOn = mode === "play";

  return (
    <button
      type="button"
      onClick={flip}
      aria-pressed={isOn}
      aria-label={isOn ? "Switch to recruiter mode" : "Switch to personality mode"}
      className={[
        "inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm transition-all duration-300",
        isOn
          ? "border-accent/45 bg-accent/15 text-accent shadow-[0_0_18px_var(--color-accent-soft)]"
          : "border-rule text-dim hover:border-muted hover:text-muted",
      ].join(" ")}
      style={{ fontFamily: "var(--font-serif)" }}
    >
      <span aria-hidden>✦</span>
    </button>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ModeToggle.tsx
git commit -m "feat(mode): add ModeToggle client component (the ✦ button)"
```

---

## Task 5: Create the `TopBar` component

**Files:**
- Create: `src/components/TopBar.tsx`

Composes `Wordmark` + `ModeToggle`. Sticky, full-bleed, ~48px tall. Stays above the existing main container.

- [ ] **Step 1: Write `src/components/TopBar.tsx`**

```tsx
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
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/TopBar.tsx
git commit -m "feat(chrome): add TopBar composing Wordmark + ModeToggle"
```

---

## Task 6: Update `globals.css` — tokens, transitions, utilities

**Files:**
- Modify: `src/app/globals.css`

Adds: play-mode accent overrides, `--font-serif`, transitions, reduced-motion overrides, `.recruiter-only` / `.play-only` utility classes, the `data-post-category` filter, body-gradient retinting via `color-mix()`.

- [ ] **Step 1: Read the current `globals.css` so the edit lands cleanly**

Run: `cat src/app/globals.css`
Confirm the file matches what's in the spec (the @theme block, the `body` background-image, etc.). If it diverges, adapt the patches below — don't blindly apply.

- [ ] **Step 2: Replace the `@theme inline` block with the version that adds `--font-serif`**

Find this block:

```css
@theme inline {
  --color-bg: #0a0a0b;
  --color-surface: #18181b;
  --color-rule: #27272a;
  --color-dim: #71717a;
  --color-muted: #a1a1aa;
  --color-fg: #e4e4e7;
  --color-fg-strong: #fafafa;
  --color-accent: #f59e0b;
  --color-accent-soft: rgba(245, 158, 11, 0.15);

  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

Replace it with:

```css
@theme inline {
  --color-bg: #0a0a0b;
  --color-surface: #18181b;
  --color-rule: #27272a;
  --color-dim: #71717a;
  --color-muted: #a1a1aa;
  --color-fg: #e4e4e7;
  --color-fg-strong: #fafafa;
  --color-accent: #f59e0b;
  --color-accent-soft: rgba(245, 158, 11, 0.15);

  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --font-serif: ui-serif, "New York", Georgia, serif;
}
```

- [ ] **Step 3: Add a `:root[data-mode="play"]` block after the `@theme` block**

Add this block immediately after the closing `}` of `@theme inline`:

```css
/* Play-mode accent override. Mode is set on <html> by the init script
   in src/components/ModeInitScript.tsx before paint, so the rest of
   the site retints automatically (anything that consumes --color-accent
   or --color-accent-soft). */
:root[data-mode="play"] {
  --color-accent: #71d0a8;
  --color-accent-soft: rgba(113, 208, 168, 0.15);
}

/* Smooth the accent shift when the user clicks ✦. We only transition
   color-related properties — layout properties stay snappy. */
:root,
:root *,
:root *::before,
:root *::after {
  transition-property: color, background-color, border-color, fill, stroke, box-shadow;
  transition-duration: 250ms;
  transition-timing-function: ease;
}

/* Respect motion preferences. */
@media (prefers-reduced-motion: reduce) {
  :root,
  :root *,
  :root *::before,
  :root *::after {
    transition-duration: 0ms !important;
  }
}
```

- [ ] **Step 4: Replace the body background-image with a retinting gradient**

Find this rule:

```css
body {
  font-family: var(--font-sans);
  font-feature-settings: "ss01", "ss02", "cv11";
  -webkit-font-smoothing: antialiased;
  background-image:
    radial-gradient(ellipse 80% 50% at 0% 0%, rgba(245, 158, 11, 0.045), transparent 60%),
    radial-gradient(ellipse 60% 40% at 100% 100%, rgba(245, 158, 11, 0.025), transparent 55%);
  background-attachment: fixed;
}
```

Replace it with:

```css
body {
  font-family: var(--font-sans);
  font-feature-settings: "ss01", "ss02", "cv11";
  -webkit-font-smoothing: antialiased;
  /* Gradient retints with --color-accent via color-mix.
     color-mix is baseline in 2026 (Safari 16.2+, Chrome 111+, FF 113+). */
  background-image:
    radial-gradient(ellipse 80% 50% at 0% 0%,
      color-mix(in srgb, var(--color-accent) 4.5%, transparent),
      transparent 60%),
    radial-gradient(ellipse 60% 40% at 100% 100%,
      color-mix(in srgb, var(--color-accent) 2.5%, transparent),
      transparent 55%);
  background-attachment: fixed;
}
```

- [ ] **Step 5: Append the mode-utility classes and post-category filters to the end of the file**

Append (at the bottom, after the existing `.post-prose` rules):

```css
/* -------------------------------------------------------------- */
/* Mode-aware visibility utilities.                                */
/* -------------------------------------------------------------- */

/* Hide play-only nodes by default. They become visible when
   <html data-mode="play"> is set. */
.play-only {
  display: none;
}
:root[data-mode="play"] .play-only {
  display: revert;
}

/* Hide recruiter-only nodes when in play mode. */
:root[data-mode="play"] .recruiter-only {
  display: none;
}

/* Post-category filter, scoped to the homepage Writing section.
   The /writing index and individual post pages do NOT use
   data-post-category, so they remain unfiltered (per spec). */
:root:not([data-mode="play"]) [data-post-category="fun"] {
  display: none;
}
:root[data-mode="play"] [data-post-category]:not([data-post-category="fun"]) {
  display: none;
}
```

- [ ] **Step 6: Run the build to catch CSS / Tailwind issues**

Run: `pnpm build`
Expected: `✓ Compiled successfully`. If Tailwind complains about an unknown utility, double-check that `--font-serif` is inside `@theme inline` (not below it).

- [ ] **Step 7: Visual smoke check**

Run: `pnpm dev` (background or second terminal). Open `http://localhost:3000`.
- Site renders identically to before (no `data-mode` attribute on `<html>` yet — those come in Task 7).
- Open devtools console: `document.documentElement.setAttribute("data-mode","play")`.
- The amber accent should shift to mint teal (`#71d0a8`) across the sidebar accent dot, the section labels (`ABOUT`, `EXPERIENCE`, etc.), the in-page nav line on hover, the timeline-rail gradient, and the body's ambient radial gradient.
- Run `document.documentElement.setAttribute("data-mode","recruiter")` — colors return to amber.

If anything doesn't retint, check that the offending rule consumes `var(--color-accent)` rather than a hardcoded color. Stop the dev server.

- [ ] **Step 8: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(theme): add data-mode accent tokens, transitions, utility classes"
```

---

## Task 7: Wire `TopBar` and `ModeInitScript` into `layout.tsx`

**Files:**
- Modify: `src/app/layout.tsx`

Add the init script to `<head>`, default `data-mode="recruiter"` on `<html>` for no-JS, mount `<TopBar />` above the body content.

- [ ] **Step 1: Read the current layout to confirm the structure**

Run: `cat src/app/layout.tsx`
Confirm the structure matches the spec snapshot.

- [ ] **Step 2: Patch `layout.tsx`**

Replace the file contents with:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ModeInitScript } from "@/components/ModeInitScript";
import { TopBar } from "@/components/TopBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vansh-dev-five.vercel.app"),
  title: {
    default: "Vansh Thakur — Full Stack Engineer",
    template: "%s · Vansh Thakur",
  },
  description:
    "Vansh Thakur — Full Stack Engineer at Hudle. Backend-leaning. Payments, search, and platform work.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://vansh-dev-five.vercel.app",
    siteName: "vansh.dev",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      // Default for no-JS / pre-paint. The init script overrides this
      // synchronously based on URL ?mode=... and localStorage.
      data-mode="recruiter"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ModeInitScript />
      </head>
      <body className="min-h-full bg-bg text-fg">
        <TopBar />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Adjust top padding on the home page to account for the new top bar**

The TopBar is `h-12` (48px). The current `src/app/page.tsx` outer container has `lg:py-0` and the sidebar/main both have `lg:py-24`. With a 48px sticky bar, the sidebar's top content currently sits behind it. Read `src/app/page.tsx`:

Run: `cat src/app/page.tsx`

Find:

```tsx
<main id="content" className="pt-24 lg:w-1/2 lg:py-24">
```

Leave it for now — we tighten it in Task 12. Verify the dev server still renders correctly.

- [ ] **Step 4: Build + visual smoke check**

Run: `pnpm build`
Expected: `✓ Compiled successfully`.

Run `pnpm dev`, open `http://localhost:3000`:
- The new top bar is visible at the top, full width, ~48px tall, with `vansh.dev` left and the ✦ button right.
- Open devtools `Elements` panel — `<html>` should have `data-mode="recruiter"` set by the init script (URL has no `?mode`, no localStorage value).
- Click ✦ → color flip happens; URL gains `?mode=play`; `<html data-mode>` is now `play`; the ✦ button is filled + glowing.
- Refresh the page → still in play mode (localStorage now has `play`), URL still has `?mode=play`.
- Click ✦ again → returns to recruiter; URL `?mode=play` is removed; localStorage now has `recruiter`.
- Open `http://localhost:3000/?mode=play` in a fresh incognito window → enters play mode immediately. Open devtools and run `localStorage.getItem("vansh-dev-mode")` — should be `null` (URL doesn't persist, per spec).
- Refresh that incognito window — still in play mode because URL still has `?mode=play`.
- Manually edit the URL to remove `?mode=play`, refresh — defaults to recruiter (localStorage was never written).
- Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(chrome): mount TopBar + ModeInitScript in layout"
```

---

## Task 8: Add the `play` variant to `site.ts`

**Files:**
- Modify: `src/lib/site.ts`

Add a `play` object holding the play-mode name, subtitle, tagline, currentlyDoing, and nav list. This is the single source of truth for play-mode copy.

- [ ] **Step 1: Read the current `site.ts`**

Run: `cat src/lib/site.ts`
Confirm structure matches the file in the spec.

- [ ] **Step 2: Replace the file contents**

```ts
export const site = {
  name: "Vansh Thakur",
  title: "Full Stack Engineer at Hudle",
  tagline:
    "I build backend systems for payments, search, and platform tooling — mostly in PHP, Go, and SQL.",
  location: "New Delhi, IN",
  timezone: "UTC+5:30",
  currentlyDoing: "Writing about rebuilding Hudle's payment pipeline without downtime.",
  email: "vansh@hudle.in",
  socials: {
    github: "https://github.com/DragoVeizen",
    linkedin: "https://www.linkedin.com/in/vanshthakur",
  },
  // Play-mode copy. Same person, off-duty voice. The Sidebar component
  // dual-renders both variants and CSS hides the inactive one.
  play: {
    name: "vansh",
    subtitle: "off-duty · Delhi",
    tagline: "weird products, anecdotal solutions, and whatever I'm reading this week.",
    currentlyDoing: 'rereading "Tidy First?"',
    nav: [
      { id: "about", label: "About" },
      { id: "writing", label: "Notes" },
    ] as const,
  },
} as const;

export const nav = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "writing", label: "Writing" },
] as const;
```

Notes:
- `site.play.nav` reuses the existing section IDs (`about`, `writing`) so the in-page anchors still work. We don't add new IDs in Phase 1.
- `site.play.currentlyDoing` is a static string for Phase 1 (the spec defers auto-derivation to Phase 2).

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors. (Existing consumers — `Sidebar.tsx`, `StatusLine.tsx` — still import `site` and use the same top-level fields.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/site.ts
git commit -m "feat(content): add site.play variant for play-mode copy"
```

---

## Task 9: Refactor `Sidebar.tsx` — dual-render

**Files:**
- Modify: `src/components/Sidebar.tsx`

Render both recruiter and play variants for h1, subtitle, tagline, and in-page nav. CSS hides the inactive one. Status line is handled in Task 11 (StatusLine.tsx).

- [ ] **Step 1: Read the current `Sidebar.tsx`**

Run: `cat src/components/Sidebar.tsx`

- [ ] **Step 2: Replace the file contents**

```tsx
import { nav, site } from "@/lib/site";
import { StatusLine } from "@/components/StatusLine";
import { GitHubIcon, LinkedInIcon, MailIcon } from "@/components/icons";

export function Sidebar() {
  return (
    <header className="lg:sticky lg:top-12 lg:flex lg:max-h-[calc(100vh-3rem)] lg:w-1/2 lg:flex-col lg:justify-between lg:py-16">
      <div>
        {/* --- H1: name. Dual-render. ----------------------------- */}
        <h1 className="text-4xl font-bold leading-[1.05] tracking-[-0.025em] text-fg-strong sm:text-5xl">
          <span className="recruiter-only">{site.name}</span>
          <span
            className="play-only"
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 500,
              textTransform: "lowercase",
            }}
          >
            {site.play.name}
          </span>
        </h1>

        {/* --- Subtitle. Dual-render. ----------------------------- */}
        <h2 className="mt-3 text-base font-medium tracking-tight text-fg sm:text-lg">
          <span className="recruiter-only">{site.title}</span>
          <span className="play-only">{site.play.subtitle}</span>
        </h2>

        {/* --- Tagline. Dual-render. ------------------------------ */}
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
          <span className="recruiter-only">{site.tagline}</span>
          <span className="play-only">{site.play.tagline}</span>
        </p>

        {/* --- In-page nav. Two separate <nav> blocks, dual-rendered. */}
        <nav className="nav hidden lg:block recruiter-only" aria-label="In-page navigation">
          <ul className="mt-16 w-max">
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="group flex items-center py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-dim transition-colors hover:text-fg-strong focus-visible:text-fg-strong"
                >
                  <span
                    aria-hidden
                    className="mr-4 h-px w-8 bg-rule transition-all group-hover:w-16 group-hover:bg-fg-strong group-focus-visible:w-16 group-focus-visible:bg-fg-strong"
                  />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="nav hidden lg:block play-only" aria-label="In-page navigation">
          <ul className="mt-16 w-max">
            {site.play.nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="group flex items-center py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-dim transition-colors hover:text-fg-strong focus-visible:text-fg-strong"
                >
                  <span
                    aria-hidden
                    className="mr-4 h-px w-8 bg-rule transition-all group-hover:w-16 group-hover:bg-fg-strong group-focus-visible:w-16 group-focus-visible:bg-fg-strong"
                  />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-12 space-y-6 lg:mt-0">
        <StatusLine />
        <ul className="flex items-center gap-5" aria-label="Social links">
          <li>
            <a
              href={`mailto:${site.email}`}
              aria-label="Email"
              className="text-muted transition-colors hover:text-accent focus-visible:text-accent"
            >
              <MailIcon className="h-5 w-5" />
            </a>
          </li>
          <li>
            <a
              href={site.socials.github}
              aria-label="GitHub"
              target="_blank"
              rel="noreferrer"
              className="text-muted transition-colors hover:text-accent focus-visible:text-accent"
            >
              <GitHubIcon className="h-5 w-5" />
            </a>
          </li>
          <li>
            <a
              href={site.socials.linkedin}
              aria-label="LinkedIn"
              target="_blank"
              rel="noreferrer"
              className="text-muted transition-colors hover:text-accent focus-visible:text-accent"
            >
              <LinkedInIcon className="h-5 w-5" />
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
```

Notes on the changes:
- `lg:top-0` → `lg:top-12` and `lg:max-h-screen` → `lg:max-h-[calc(100vh-3rem)]` so the sidebar offset accounts for the 48px top bar.
- `lg:py-24` → `lg:py-16` for similar reason — the bar already provides vertical space at the top.
- Two `<nav>` blocks with `recruiter-only` / `play-only`. Each has its own `aria-label`; only one is visible to AT users at a time because the other has `display: none`.

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Visual verification**

Run: `pnpm dev`. Open `http://localhost:3000`:
- Recruiter mode: "Vansh Thakur" bold sans h1, "Full Stack Engineer at Hudle" subtitle, current tagline, full nav (About · Experience · Projects · Writing).
- Click ✦: h1 cross-fades to *vansh* (lowercase, italic serif), subtitle → "off-duty · Delhi", tagline → play tagline, nav shrinks to About · Notes.
- Verify the sidebar doesn't slide under the top bar — it should sit just below.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/Sidebar.tsx
git commit -m "refactor(sidebar): dual-render h1/subtitle/tagline/nav per mode"
```

---

## Task 10: Refactor `StatusLine.tsx` — dual-render

**Files:**
- Modify: `src/components/StatusLine.tsx`

Two `Currently · …` lines, one per mode. CSS hides the inactive one.

- [ ] **Step 1: Read the current `StatusLine.tsx`**

Run: `cat src/components/StatusLine.tsx`

- [ ] **Step 2: Replace the file contents**

```tsx
import { site } from "@/lib/site";

export function StatusLine() {
  return (
    <div className="space-y-2 font-mono text-[11px] leading-5 text-dim">
      <p className="flex items-start gap-2.5">
        <span
          aria-hidden
          className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]"
        />
        <span>
          <span className="text-muted">Currently · </span>
          <span className="text-fg recruiter-only">{site.currentlyDoing}</span>
          <span className="text-fg play-only">{site.play.currentlyDoing}</span>
        </span>
      </p>
      <p className="pl-4 text-dim">
        {site.location} · {site.timezone}
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Visual verification**

Run: `pnpm dev`. Open `http://localhost:3000`:
- Recruiter: status reads `● Currently · Writing about rebuilding Hudle's payment pipeline without downtime.`
- Click ✦: status changes to `● Currently · rereading "Tidy First?"`. The dot retints to mint teal automatically (it consumes `var(--color-accent)`).

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/StatusLine.tsx
git commit -m "refactor(status): dual-render currently line per mode"
```

---

## Task 11: Refactor `Writing.tsx` — `data-post-category` + dual title + recruiter-only upcoming card

**Files:**
- Modify: `src/components/Writing.tsx`

Each post `<li>` gets `data-post-category`. The CSS filter in Task 6 hides the wrong category per mode. The section heading dual-renders ("Writing" / "Notes"). The hardcoded "Upcoming" placeholder card is a case-study teaser; mark it `recruiter-only`.

- [ ] **Step 1: Read the current `Writing.tsx` and the current `Section.tsx`**

Run: `cat src/components/Writing.tsx`
Run: `cat src/components/Section.tsx`

Notice `<Section label="Writing">` renders the label as the section heading. We need the heading to flip between "Writing" (recruiter) and "Notes" (play). Two options:
1. Pass a JSX node as `label` to `Section`, with both spans.
2. Inline the section manually in Writing.tsx, bypassing `Section`.

Option 1 requires changing `Section`'s prop type from `string` to `ReactNode`. That breaks the `aria-label` which expects a string. Skip option 1.

Option 2: keep `Section` untouched. Use `aria-label="Writing"` (recruiter-side label as the accessible name — it's the more common case) and render two visible heading texts inside. Then the visible heading is dual-rendered while the accessible name stays stable.

Actually re-reading Section.tsx: it uses `aria-label={label}` on the `<section>`, and renders the same label in an h2. To swap the visible text without swapping aria-label, we'd need a custom heading.

Cleanest: render the section manually here, ditch `<Section>` for this component, keep `<Section>` for others. The duplicated chrome is ~6 lines; acceptable.

- [ ] **Step 2: Replace the file contents**

We bypass `<Section>` here so the visible heading can dual-render ("Writing" / "Notes") while the section's `aria-label` stays stable. All other section chrome (sticky header treatment, padding, classes) is inlined to match `Section.tsx` — keep this section's chrome in sync if `Section` changes later. The previously-imported `Section` is dropped from the import list since it's no longer used.

```tsx
import type { ReactNode } from "react";
import { Card } from "@/components/Card";
import {
  AsteriskIcon,
  DiamondIcon,
  PipelineIcon,
} from "@/components/icons";
import {
  formatPostDate,
  getAllPosts,
  POST_CATEGORY_LABEL,
  type PostCategory,
} from "@/lib/posts";

// Bypasses <Section> so we can dual-render the visible heading
// ("Writing" / "Notes") while keeping section chrome stable.
// If Section.tsx ever changes, keep this section's chrome in sync.

const categoryIcon: Record<PostCategory, ReactNode> = {
  technical: <PipelineIcon className="h-5 w-5" />,
  "case-study": <DiamondIcon className="h-5 w-5" />,
  fun: <AsteriskIcon className="h-5 w-5" />,
};

export async function Writing() {
  const posts = await getAllPosts();

  return (
    <section
      id="writing"
      aria-label="Writing"
      className="scroll-mt-16 py-16 first:pt-0 lg:py-20 lg:scroll-mt-24"
    >
      <div className="sticky top-0 z-20 -mx-6 mb-10 bg-bg/80 px-6 py-4 backdrop-blur md:-mx-12 md:px-12 lg:static lg:mx-0 lg:mb-8 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
          <span className="recruiter-only">Writing</span>
          <span className="play-only">Notes</span>
        </h2>
      </div>

      <ul className="grid grid-cols-1 gap-4">
        {posts.map((p) => (
          <li key={p.slug} data-post-category={p.category}>
            <Card
              href={`/writing/${p.slug}`}
              icon={categoryIcon[p.category]}
              label={`${POST_CATEGORY_LABEL[p.category]} · ${formatPostDate(p.date)}`}
              title={p.title}
              description={p.excerpt}
            />
          </li>
        ))}
        <li className="recruiter-only">
          <Card
            icon={<DiamondIcon className="h-5 w-5" />}
            label="Case Study · Upcoming"
            title="Rebuilding Hudle's payment pipeline without downtime"
            description="A 9-table entity split, dual-write, and middleware-rebinding — how we replaced a monolithic payment schema in production with feature flags and zero customer impact."
          />
        </li>
      </ul>
    </section>
  );
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 4: Visual verification**

Run: `pnpm dev`. Open `http://localhost:3000`:
- Recruiter mode: section heading reads "Writing"; the existing `hello-world.mdx` post (tagged `fun`) is hidden via CSS; the "Upcoming" case-study card is visible.
- Click ✦: heading flips to "Notes"; `hello-world.mdx` card appears; the "Upcoming" case-study card hides.
- Navigate to `/writing` (the index route) — still shows all posts including fun ones (unchanged per spec).
- Navigate to `/writing/hello-world` — post body renders; in play mode the links + inline-code background are mint teal, in recruiter mode they're amber.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/Writing.tsx
git commit -m "refactor(writing): filter posts by mode and dual-render heading"
```

---

## Task 12: Update `page.tsx` — recruiter-only sections + canonical URL

**Files:**
- Modify: `src/app/page.tsx`

Wrap Experience and Projects in `recruiter-only`. Add `alternates.canonical: '/'` so `?mode=play` doesn't fragment search ranking. Adjust top padding now that the top bar exists.

- [ ] **Step 1: Read the current `page.tsx`**

Run: `cat src/app/page.tsx`

- [ ] **Step 2: Replace the file contents**

```tsx
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
```

Notes:
- `lg:py-24` → `lg:py-16` on the outer container's md+ padding and the main; the top bar handles the upper breathing room.
- Wrapping `Experience` and `Projects` in `<div className="recruiter-only">` rather than passing the class to the components keeps the existing components 100% untouched (per spec's "Unchanged" list).

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 4: Build (catches metadata-shape issues)**

Run: `pnpm build`
Expected: `✓ Compiled successfully`. View the generated HTML for the homepage and confirm `<link rel="canonical" href="..."/>` resolves to `/`:

```bash
curl -s http://localhost:3000 | grep -i canonical
```

(Run `pnpm dev` first; expected output includes `<link rel="canonical" href="https://vansh-dev-five.vercel.app/"/>` because of the `metadataBase` set in layout.tsx.)

- [ ] **Step 5: Visual verification**

With `pnpm dev` running, open `http://localhost:3000`:
- Recruiter mode: About → Experience → Projects → Writing visible. Sections sit just below the top bar with comfortable spacing.
- Click ✦: Experience and Projects fade out (display: none); only About → Notes remain in the main column. The page is shorter; verify no broken layout.
- Click ✦ again → Experience and Projects return.
- Open `http://localhost:3000/?mode=play` directly → immediately renders About + Notes only, no flicker.

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx
git commit -m "refactor(home): hide Experience+Projects in play mode; canonicalize URL"
```

---

## Task 13: End-to-end manual verification

**Files:** none modified — this is the final acceptance pass.

This is the full Test Surface from the spec, run as a single ordered checklist. Take notes; if any item fails, fix and commit before continuing.

- [ ] **Step 1: Start a fresh dev server and a fresh incognito window**

Run: `pnpm dev`
Open: `http://localhost:3000` in a fresh incognito Chrome window (or equivalent — important: no prior localStorage).

- [ ] **Step 2: First-visit defaults to recruiter**

- Page shows amber accent, "Vansh Thakur", full nav.
- DevTools → Application → Local Storage → no `vansh-dev-mode` key present.
- URL has no `?mode=` param.

- [ ] **Step 3: Clicking ✦ flips, persists, and updates URL**

- Click the ✦ button.
- Accent transitions to mint teal over ~250ms.
- Sidebar h1 cross-fades to *vansh* (italic serif lowercase).
- Subtitle → "off-duty · Delhi"; tagline → play tagline; nav → About · Notes.
- Status line changes to `rereading "Tidy First?"`.
- Experience + Projects sections disappear.
- Writing section retitles to "Notes" and shows only the hello-world post.
- URL becomes `http://localhost:3000/?mode=play`.
- localStorage now has `vansh-dev-mode = "play"`.

- [ ] **Step 4: Refresh persists play mode without flash**

- Reload the page.
- Mode renders as play instantly — no amber flash before the transition.
- `<html data-mode="play">` is set before any visible content paints.

- [ ] **Step 5: Clicking ✦ again returns to recruiter and removes the URL param**

- Click ✦.
- Accent flips back to amber.
- Sidebar h1 returns to "Vansh Thakur".
- Experience + Projects reappear.
- URL becomes `http://localhost:3000/`.
- localStorage has `vansh-dev-mode = "recruiter"`.

- [ ] **Step 6: Shared `?mode=play` link works without persisting**

- Open a *new* incognito window (no localStorage from the previous tab).
- Navigate to `http://localhost:3000/?mode=play`.
- Renders in play mode immediately, no flicker.
- DevTools → Application → Local Storage → no `vansh-dev-mode` key.
- Manually edit the URL to remove `?mode=play` and reload.
- Renders in recruiter mode (no persisted preference).

- [ ] **Step 7: `?mode=recruiter` forces recruiter regardless of localStorage**

- In the same incognito session, click ✦ to flip to play (localStorage gets `play`).
- Navigate to `http://localhost:3000/?mode=recruiter`.
- Renders in recruiter mode despite localStorage holding `play`.
- localStorage still holds `play` (URL param doesn't overwrite).
- Remove the URL param and reload — returns to play mode (localStorage wins).

- [ ] **Step 8: Invalid URL value falls through**

- Navigate to `http://localhost:3000/?mode=xyz` in a fresh incognito.
- Renders in recruiter mode (invalid value ignored; no localStorage → default).
- localStorage has no entry.

- [ ] **Step 9: No-JS fallback renders recruiter mode**

- DevTools → Settings (⚙) → Debugger → Disable JavaScript.
- Reload the page.
- Renders in recruiter mode with no errors.
- The ✦ button is visible but doesn't do anything when clicked.
- Re-enable JavaScript.

- [ ] **Step 10: Keyboard accessibility**

- Press Tab repeatedly from the top of the page.
- Verify the ✦ button receives focus (visible focus ring).
- With ✦ focused, press Space → mode toggles.
- Press Enter while focused → mode toggles back.
- Inspect ✦ in DevTools → `aria-pressed` reflects current mode; `aria-label` updates ("Switch to personality mode" / "Switch to recruiter mode").

- [ ] **Step 11: Reduced-motion preference**

- DevTools → Rendering tab → Emulate CSS media → `prefers-reduced-motion: reduce`.
- Click ✦. Mode flips instantly with no color transition or cross-fade.
- Reset emulation.

- [ ] **Step 12: Post pages inherit mode**

- In play mode, click the `hello-world` post card → navigate to `/writing/hello-world`.
- Post body shows mint-teal-accented inline code (the backtick spans in the post).
- Click ✦ on the post page → palette flips to amber.
- Click the back-arrow ← vansh.dev → return home; mode persists per localStorage.

- [ ] **Step 13: `/writing` index unchanged**

- Navigate to `/writing`.
- All posts visible regardless of mode (per spec — index is not category-filtered).
- The accent (Writing heading, category labels) still retints with mode.

- [ ] **Step 14: Lighthouse accessibility score does not regress**

- DevTools → Lighthouse → Generate report (Accessibility category only, mobile).
- Score is ≥ baseline (record the pre-Task-0 baseline if you have it; otherwise aim for ≥ 95).
- Stop the dev server.

- [ ] **Step 15: Final build + commit any verification-driven fixes**

Run: `pnpm build`
Expected: `✓ Compiled successfully` with no warnings about hydration or metadata.

If Steps 2-14 surfaced any issues, fix them in focused commits before declaring complete. If everything passed, no new commit needed for this task.

---

## Done

When all tasks above are checked off:

1. The spec's Phase 1 scope is fully implemented.
2. All five user flows in the spec render correctly.
3. The Phase 2 work (Now / Reading / Shelf surfaces, auto-derived status line) is unblocked — none of the Phase 1 architecture forecloses it; it's purely additive.

**Suggested final commit message for the summary PR (if you open one):**

```
feat: dual-mode (recruiter / play) site with ✦ toggle

Adds a personality-mode flip to vansh.dev. ★ button in a new top bar
toggles the site between recruiter mode (current default) and a play
mode with mint-teal accents, italic-serif h1, and only fun-tagged
posts visible. Mode persists per-device via localStorage and is
shareable via ?mode=play. First-time visitors always land on recruiter.

Implements docs/superpowers/specs/2026-05-20-vansh-dev-dual-mode-design.md.
Now / Reading / Shelf surfaces are Phase 2 and not in this PR.
```
