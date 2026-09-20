import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7 shrink-0", className)}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8 11h16M8 16h10M8 21h6"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
      />
      <circle cx="23" cy="21" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3 text-foreground">
      <LogoMark />
      <div className="min-w-0 leading-tight">
        <div className="truncate text-[13px] font-medium tracking-wide">
          {compact ? "SJCC" : "St. Joseph Compliance"}
        </div>
        <div className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {compact ? "stjcc.online" : "Company · stjcc.online"}
        </div>
      </div>
    </div>
  );
}
