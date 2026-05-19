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
