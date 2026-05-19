"use client";

// src/components/ModeToggle.tsx
//
// The ✦ button. Single client component for the whole feature.
//
// State sync uses useSyncExternalStore:
//   - getServerSnapshot returns "recruiter" — matches the data-mode="recruiter"
//     fallback set in layout.tsx for SSR / no-JS, so server markup is consistent.
//   - getSnapshot reads <html data-mode> on the client.
//   - subscribe attaches a MutationObserver on <html>'s data-mode attribute,
//     so if the attribute ever changes (it can only change from this very
//     component, but the observer keeps the contract explicit), the snapshot
//     is re-read and the component re-renders.
//
// On click: we set the DOM attribute first (which fires the MutationObserver
// → re-render), then write localStorage + update URL via history.replaceState.

import { useSyncExternalStore } from "react";
import {
  MODE_QUERY_PARAM,
  MODE_STORAGE_KEY,
  isValidMode,
  type Mode,
} from "@/lib/mode";

function subscribe(onStoreChange: () => void): () => void {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-mode"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Mode {
  const v = document.documentElement.dataset.mode;
  return isValidMode(v) ? v : "recruiter";
}

function getServerSnapshot(): Mode {
  return "recruiter";
}

export function ModeToggle() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function flip() {
    const next: Mode = mode === "play" ? "recruiter" : "play";

    // Setting the attribute triggers the MutationObserver in subscribe(),
    // which causes useSyncExternalStore to re-read and re-render.
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
