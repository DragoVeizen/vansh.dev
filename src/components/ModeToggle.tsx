"use client";

// src/components/ModeToggle.tsx
//
// The ✦ button. Single client component for the whole feature.
//
// On click: flips mode, writes localStorage, updates URL via
// history.replaceState (no history entry — back button stays clean).
//
// Initial state: read once from <html data-mode> via the useState
// initializer. The init script in <head> set the attribute pre-paint,
// so this read is the same value the user is already seeing. We don't
// use useEffect+setState here because React 19's
// react-hooks/set-state-in-effect rule discourages it, and the
// initializer pattern is functionally equivalent (one read, no flicker).

import { useState } from "react";
import {
  MODE_QUERY_PARAM,
  MODE_STORAGE_KEY,
  isValidMode,
  type Mode,
} from "@/lib/mode";

function readInitialMode(): Mode {
  // Server: no DOM, default recruiter.
  if (typeof document === "undefined") return "recruiter";
  const v = document.documentElement.dataset.mode;
  return isValidMode(v) ? v : "recruiter";
}

export function ModeToggle() {
  const [mode, setMode] = useState<Mode>(readInitialMode);

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
