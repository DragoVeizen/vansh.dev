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
