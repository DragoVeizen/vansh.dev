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
