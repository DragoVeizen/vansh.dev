# vansh.dev — dual-mode redesign

**Date:** 2026-05-20
**Author:** Vansh Thakur (with brainstorm assist)
**Status:** Approved design; implementation plan to follow.

## Summary

Add a second "mode" to `vansh.dev`. The default `recruiter` mode is the current portfolio. A new `play` mode flips the same site into a personal-feeling room — different sidebar copy, different accent color, a hint of serif typography, and a different set of main-column sections. The flip is triggered by a ✦ button in a new top bar next to the wordmark `vansh.dev`. Mode is sticky per-device via `localStorage` and shareable via `?mode=play`. First-time visitors always see recruiter mode.

This is **Phase 1 only**. Phase 2 (Now / Reading / Shelf data surfaces, auto-derived status line) is out of scope and called out where relevant.

---

## Goals

1. Recruiters and hiring managers continue to land on a polished, focused portfolio. Nothing about their path slows down.
2. Peers, friends, and curious visitors can flip into a more personal version of the same site via a single click on a star/sparkle in the top bar.
3. The personality side can be linked to directly (`vansh.dev/?mode=play`) so the easter egg can be shared without forcing every recruiter to see it.
4. Shipping the *moment of magic* (the toggle + visual flip + Notes filter) is more important than shipping every personality-side surface on day one.

## Non-goals (Phase 1)

- Now / Reading / Shelf surfaces. Deferred to Phase 2.
- Auto-derived status line (e.g., "rereading whatever's at the top of Reading"). Deferred to Phase 2.
- Web-font selection for serif (using system `ui-serif` for v1).
- Tooltip / copy hinting at the easter egg's existence. The star is unexplained on purpose.
- Mobile-specific nav menu in the top bar. Mobile keeps the current scroll-only behavior.
- Per-post-category palette overrides on `/writing/<slug>` pages (e.g., forcing technical posts to amber even in play mode). Pages inherit global mode.

---

## Scope and surfaces

**Phase 1 ships:**

- Sticky top bar component across both modes: wordmark `vansh.dev` (left) + ✦ toggle (right).
- Sidebar updated with mode-aware content (name, subtitle, tagline, in-page nav, status line, socials).
- Mode state: `recruiter` (default) and `play`. Stored in `localStorage`; first visit always `recruiter`; URL `?mode=play` opens directly into personality.
- Visual flip via CSS attribute selectors on `<html data-mode="play">`: accent shift (amber → mint teal), italic-serif on the sidebar h1 in play mode, micro-copy swaps. Same layout, same typography otherwise.
- Writing component gains a category filter via CSS — recruiter mode hides `fun` posts, play mode shows only `fun` (renamed **Notes** in personality).
- **Sections rendered in personality mode (Phase 1):** About + Notes (filtered Writing). Experience and Projects are hidden via CSS in play mode.

**Phase 2 (deferred):**

- Now / Reading / Shelf as data-driven sections under `/src/data/`.
- Auto-derived status line in personality mode (pulls from top Reading entry).

---

## Information architecture

### Page anatomy (both modes)

```
┌──────────────────────────────────────────────┐
│ Top bar (sticky)                             │
│   vansh.dev                              ✦   │
└──────────────────────────────────────────────┘
┌──────────────────┬───────────────────────────┐
│ Sidebar          │ Main column               │
│   (sticky on lg) │   (scrolling)             │
│                  │                           │
│   Name (h1)      │   About         [both]    │
│   Subtitle       │   Experience  [recruiter] │
│   Tagline        │   Projects    [recruiter] │
│                  │   Writing/Notes [both]    │
│   In-page nav    │                           │
│                  │                           │
│   Status line    │                           │
│   Socials        │                           │
└──────────────────┴───────────────────────────┘
```

Main-column sections marked `[recruiter]` are hidden via CSS in play mode. The Writing section renders in both modes but retitles to **Notes** and filters posts in play mode.

### Mode-aware copy table

The table below covers all visible copy that shifts with the mode — top-bar wordmark plus sidebar contents.

| Location | Recruiter | Play |
|---|---|---|
| Top-bar wordmark | `vansh.dev` | `vansh.dev` *(same; the ✦ next to it switches state)* |
| Sidebar h1 (name) | Vansh Thakur | *vansh* *(lowercase, italic serif)* |
| Subtitle | Full Stack Engineer at Hudle | off-duty · Delhi |
| Tagline | "I build backend systems for payments, search, and platform tooling — mostly in PHP, Go, and SQL." | "weird products, anecdotal solutions, and whatever I'm reading this week." |
| Nav items | About · Experience · Projects · Writing | About · Notes |
| Status line | `● writing about payments` *(from `currentlyDoing`)* | `● rereading "Tidy First?"` *(static string for Phase 1)* |
| Socials | Mail · GitHub · LinkedIn | Mail · GitHub · LinkedIn *(unchanged)* |

### Layout changes from today

- New: top bar component, sticky, full bleed, ~48–56px tall. Lives above the existing flex container.
- Sidebar: structure unchanged. Top padding reduces (`lg:py-24` → `lg:pt-12 lg:pb-24`) since the top bar now eats vertical space above it.
- Main column: structure unchanged. Same top-padding adjustment.
- Mobile: top bar stays sticky. Sidebar's vertical nav remains `hidden lg:block`. Top bar does *not* add a mobile nav menu in Phase 1.

### DOM-level signal

Mode lives on `<html data-mode="recruiter | play">`. Everything visual reads from that attribute. No per-component prop drilling.

---

## Mode toggle behavior

### State model

`mode: 'recruiter' | 'play'`. Stored on `<html data-mode="...">`. One source of truth.

### Read order on every page load

1. URL has `?mode=play` (or `?mode=recruiter`) → use that. **Do not write to localStorage.** Shared links are "view once" — clicking a friend's `?mode=play` link doesn't trap a recruiter in personality mode forever.
2. Else, read `localStorage["vansh-dev-mode"]` → use that if value is `'play'` or `'recruiter'`.
3. Else (first-ever visit, no key, or invalid value) → default `recruiter`.

### What happens when the user clicks ✦

- Flip state in `<html data-mode>`.
- Write the new value to `localStorage["vansh-dev-mode"]`. ← only explicit clicks persist.
- Update the URL via `history.replaceState`. Entering play mode adds `?mode=play`; returning to recruiter removes the param.

### SSR / hydration

Mode is a client concern, but a naive React state would flash recruiter content before reading localStorage. Standard fix: an inline `<script>` in `<head>` that reads URL + localStorage and sets `<html data-mode="...">` *before* React hydrates. (Same pattern as `next-themes`.) The script is ~20 LOC inline. Unblocking. No layout shift.

### Accessibility

- ✦ is a `<button>` with `aria-pressed={mode === 'play'}` and a dynamic `aria-label` ("Switch to personality mode" / "Switch to recruiter mode").
- Keyboard: Tab focuses, Space/Enter toggles.
- `prefers-reduced-motion: reduce` → all mode-related transitions become `0ms`. No bouncing, no rotation, no cross-fade.

### SEO

- Recruiter mode is canonical. `?mode=play` adds `<link rel="canonical" href="/">` so Google doesn't split-rank.
- Personality mode is not a separate route → no URL fragmentation.
- Notes posts under `/writing/<slug>` are indexed normally regardless of mode.

### Edge cases

- Both `?mode=play` *and* a saved `recruiter` in localStorage → URL wins for this load; localStorage is *not* overwritten.
- URL has an invalid value (`?mode=xyz`) → ignored; falls through to localStorage, then to `recruiter` default.
- localStorage holds an invalid value (e.g., from manual tampering) → ignored; falls through to `recruiter` default.
- JavaScript disabled → page renders recruiter mode (the inline script doesn't run; `data-mode` defaults to `recruiter` server-side via `<html data-mode="recruiter">` in `layout.tsx`). ✦ does nothing. Acceptable trade-off.

---

## Visual flip recipe

Everything below is driven by `<html data-mode="play">` swapping CSS custom properties on `:root`. No component logic.

### Tokens that change

| Token | Recruiter | Play |
|---|---|---|
| `--color-accent` | `#f59e0b` *(current amber)* | `#71d0a8` *(monkeytype-style mint teal)* |
| `--color-accent-soft` | `rgba(245, 158, 11, 0.15)` | `rgba(113, 208, 168, 0.15)` |
| Ambient body gradient | amber rgba blobs *(current values)* | mint teal rgba blobs *(same gradient, recolored)* |

Implementation note: the body gradient is currently hard-coded with amber rgba in `globals.css`. Rebuild the gradient using `color-mix(in srgb, var(--color-accent) X%, transparent)` so it retints automatically with the accent token. `color-mix()` is baseline (Safari 16.2+, Chrome 111+, Firefox 113+); browser support is not a concern in 2026. The Risks section retains a fallback path if it ever becomes one.

### Typography deltas

| Element | Recruiter | Play |
|---|---|---|
| Top-bar wordmark `vansh` | Geist sans, weight 600 | unchanged |
| Top-bar `.dev` | Italic serif (`ui-serif, "New York", Georgia, serif`), color = `var(--color-accent)` | unchanged structure; color shifts because the accent token shifts |
| Sidebar `h1` ("Vansh Thakur" / "vansh") | Geist sans, weight 700, capitalized | Italic serif (same stack as `.dev`), lowercase, weight 500 |
| Sidebar subtitle, tagline, body, section labels | unchanged | unchanged |

Serif appears in exactly two places: top-bar `.dev` (always, both modes — editorial signature) and sidebar h1 (only in play mode).

### Transition timing

- When ✦ flips, all CSS-variable-driven colors transition over **250ms ease**.
- The sidebar h1 text swap (Vansh Thakur ↔ vansh) cross-fades over **180ms** via overlapping siblings (see Component changes).
- `prefers-reduced-motion: reduce` → all transitions become `0ms`.

### What does not change between modes

- Layout, spacing, type scale (except sidebar h1 weight).
- Section component shapes (cards, timeline rail, tags).
- The `bg`, `surface`, `rule`, `dim`, `muted`, `fg`, `fg-strong` neutrals.
- The focus ring color follows `--color-accent` and therefore shifts automatically — desired.

### Post-page inheritance rule

Decision: post pages (`/writing/<slug>`) inherit the global mode. A technical post viewed while play mode is active will show mint-teal-accent links + mint-teal inline-code background. Consistency across the site beats consistency per-post-category.

---

## Component changes

State model recap: mode lives only in the DOM (`<html data-mode>`) plus localStorage and URL. **No React context, no provider, no `useMode()` hook consumed by components.** Components are pure markup; CSS attribute selectors do the work. Only the ✦ button is a client component.

### New files

| File | Purpose |
|---|---|
| `src/components/TopBar.tsx` | Sticky top strip. Renders `<Wordmark />` + `<ModeToggle />`. Server component. |
| `src/components/Wordmark.tsx` | `vansh.dev` with sans `vansh` + italic-serif `.dev`. Server component. |
| `src/components/ModeToggle.tsx` | `'use client'`. The ✦ button. On click: flips `data-mode`, writes localStorage, updates URL via `history.replaceState`. Reads initial state from `document.documentElement.dataset.mode` on mount. |
| `src/components/ModeInitScript.tsx` | Renders an inline `<script>` via `dangerouslySetInnerHTML` — reads URL + localStorage and sets `data-mode` before paint. |
| `src/lib/mode.ts` | Constants: `MODE_STORAGE_KEY = "vansh-dev-mode"`, `MODE_QUERY_PARAM = "mode"`, `MODE_VALUES = ["recruiter", "play"] as const`. Exports the init script source as a string used by `ModeInitScript`. |

### Modified files

| File | What changes |
|---|---|
| `src/app/layout.tsx` | `<head>` gets `<ModeInitScript />`. `<body>` gets `<TopBar />` above the existing container. Body padding adjusts for top-bar height. |
| `src/app/page.tsx` | Renders About + Experience + Projects + Writing in source order. Experience + Projects wrap in `<div className="recruiter-only">`. |
| `src/components/Sidebar.tsx` | Renders **both** h1 variants (`Vansh Thakur` and `vansh`) as overlapping siblings in the same grid cell with `recruiter-only` / `play-only` classes — CSS hides the wrong one and cross-fades on transition. Same trick for subtitle, tagline, in-page nav list, and status line text. Socials render once. Top padding adjusted to account for the new top bar. |
| `src/components/Writing.tsx` | Renders all posts. Each `<li>` gets `data-post-category` attribute. CSS hides `fun` in recruiter mode and non-`fun` in play mode. Section heading uses the dual-render trick: "Writing" (recruiter) / "Notes" (play). |
| `src/components/StatusLine.tsx` | Dual-render trick: two strings, CSS picks one. Recruiter pulls from `site.currentlyDoing`; play pulls from `site.play.currentlyDoing` (static string for Phase 1). |
| `src/lib/site.ts` | Add a `play` object: `play.name`, `play.subtitle`, `play.tagline`, `play.currentlyDoing`, `play.nav` (the in-page nav list for play mode). Single source of truth for both modes' copy. |
| `src/app/globals.css` | Add `:root[data-mode="play"]` block overriding `--color-accent` + `--color-accent-soft`. Add transition rules. Add `--font-serif` variable. Add `.recruiter-only` / `.play-only` utility classes. Add the `data-post-category` filter selectors. Rebuild body gradient to retint with the accent. Add `prefers-reduced-motion` overrides. |

### Unchanged files

`About.tsx`, `Card.tsx`, `Section.tsx`, `Tag.tsx`, `icons.tsx`, `Experience.tsx`, `Projects.tsx`, `data/experience.ts`, `data/projects.ts`, `lib/posts.ts`, `app/writing/page.tsx`, `app/writing/[slug]/*`, `app/icon.tsx`, `app/opengraph-image.tsx`.

### Why the dual-render + CSS-hide trick

Avoids hydration flicker, avoids mode-aware React components, keeps the recruiter SSR markup byte-identical to today (the personality copy is in the DOM but `display: none`). Cost: ~30 extra lines of markup in the Sidebar. Worth it.

### Test surface (mostly manual)

- ✦ click toggles mode and updates URL + localStorage. Refresh persists.
- `?mode=play` direct entry works, **does not** write localStorage.
- `?mode=recruiter` forces recruiter regardless of localStorage.
- JavaScript disabled → recruiter renders correctly with no errors.
- `prefers-reduced-motion: reduce` → no transitions on mode flip.
- Keyboard: Tab reaches ✦, Space/Enter toggles, `aria-pressed` updates.
- Lighthouse a11y score does not regress.

---

## Core user flows

### Flow 1 — Recruiter lands on `vansh.dev/`

1. Top bar: `vansh.dev` (sans + italic serif `.dev`) + quiet outlined ✦.
2. Sidebar: Vansh Thakur, Full Stack Engineer at Hudle, tagline, in-page nav, status line, socials.
3. Main column: About → Experience → Projects → Writing (technical + case-study posts only).
4. CTAs: socials in sidebar, post links in Writing. ✦ never blocks the path.

### Flow 2 — Visitor clicks ✦

1. 250ms color transition: accent amber → mint teal, ambient gradient retints.
2. Sidebar h1 cross-fades: **Vansh Thakur** → *vansh*.
3. Subtitle → *off-duty · Delhi*. Tagline → play version. Nav collapses to About · Notes. Status → `● rereading "Tidy First?"`.
4. Main column: Experience + Projects hidden via CSS. Writing retitles to **Notes**, hides non-fun posts.
5. URL gets `?mode=play`. localStorage stores `play`. ✦ fills + glows.

### Flow 3 — Visitor lands directly on `vansh.dev/?mode=play`

Same as Flow 2's end state, but no animation — init script sets `data-mode="play"` before paint. localStorage is **not** written, so the visitor's next visit defaults to recruiter unless they explicitly click ✦.

### Flow 4 — Visitor clicks a Notes post while in play mode

Navigates to `/writing/<slug>`. The post page inherits `data-mode="play"`. Post body shows mint-teal-accent links + mint-teal inline-code background. ✦ stays in the top bar; clicking it flips the post page to recruiter palette.

### Flow 5 — Returning visitor who previously clicked ✦

`data-mode` defaults to nothing → init script reads localStorage → finds `play` → sets `data-mode="play"` before paint. Play mode shown immediately, no flash.

---

## Risks and mitigations

- **Empty-room feeling in play mode (Phase 1).** Personality nav has only two items (About · Notes). If no fun-tagged post exists when this ships, Notes is empty. *Mitigation:* tag `hello-world.mdx` as `fun`, or add at least one new fun post in the same PR.
- **Italic-serif fallback risk.** `ui-serif` resolves to "New York" on macOS, Times on Windows. Times italic looks dated. *Mitigation:* decide later whether to ship a web font (Instrument Serif or Fraunces). Not in Phase 1 scope; acceptable for v1.
- **SEO duplication.** `?mode=play` shows different visible content. Adding `<link rel="canonical" href="/">` should be enough. *Mitigation:* manual robots check after deploy.
- **Star is the only entry to play mode.** First-time visitors have no copy hinting at it. *This is intentional* — rediscovery is the joy. Could revisit if discovery becomes a goal.
- **Body gradient retinting via `color-mix()`.** If browser support concerns surface, fall back to a parallel `--bg-radial-color` custom property and let the `[data-mode]` rule swap that explicitly.

---

## Out of scope (Phase 2 placeholders)

These appear in the brainstorm history but are explicitly **not** designed in this spec:

- **Now section** — "what I'm doing this month / week."
- **Reading section** — currently reading + recent finishes.
- **Shelf section** — curated grid of things you find cool.
- **Auto-derived play-mode status line** — currently a static string; Phase 2 reads from the top Reading entry.

When Phase 2 kicks off, the play-mode nav (`About · Notes`) expands to (`Now · Reading · Shelf · Notes`), and these become data files under `/src/data/now.ts`, `/src/data/reading.ts`, `/src/data/shelf.ts`. The chrome and toggle mechanics stay unchanged.
