import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PageIntro, PublicShell } from "@/components/public-shell";
import { LEARN } from "@/lib/learn";

export function LearnArticle({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <PublicShell>
      <PageIntro eyebrow={eyebrow} title={title} lede={lede} />
      <article className="mx-auto max-w-3xl space-y-8 px-4 py-12 text-sm leading-relaxed text-muted-foreground sm:px-6">
        {children}
        <p className="border-t border-border pt-6 text-xs">
          This is a plain description of SJCC and of public DOT rules. It is not legal advice. The employer remains responsible for compliance.
        </p>
      </article>
      <nav className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {LEARN.map((item) => (
            <Link key={item.to} to={item.to} className="bg-background px-4 py-4 hover:bg-card">
              <span className="block text-sm text-foreground">{item.title}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{item.detail}</span>
            </Link>
          ))}
        </div>
      </nav>
    </PublicShell>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="text-2xl text-foreground">{children}</h2>;
}
