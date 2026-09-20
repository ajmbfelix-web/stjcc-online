import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em]",
  {
    variants: {
      tone: {
        idle: "border-border text-muted-foreground",
        live: "border-accent/40 text-accent",
        ok: "border-ok/40 text-ok",
        warn: "border-warn/40 text-warn",
        danger: "border-destructive/40 text-destructive",
      },
    },
    defaultVariants: { tone: "idle" },
  },
);

function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { Badge };
