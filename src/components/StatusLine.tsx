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
