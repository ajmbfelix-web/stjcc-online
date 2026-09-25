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
      <PageIntro eyebrow={eyebrow} title={title} lede={lede} chips={["Plain language", "Not legal advice", "Employer stays responsible"]} />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="soft-card space-y-8 p-6 text-sm leading-relaxed text-muted-foreground sm:p-8">
          {children}
          <p className="border-t border-border pt-6 text-xs">
            This is a plain description of SJCC and of public DOT rules. It is not legal advice. The employer remains responsible for compliance.
          </p>
        </div>
      </article>
      <nav className="border-t border-border" aria-label="Learn">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {LEARN.map((item, index) => (
            <Link key={item.to} to={item.to} className="soft-card pop-card px-4 py-4">
              <span className="font-mono text-xs text-accent">{String(index + 1).padStart(2, "0")}</span>
              <span className="mt-2 block text-sm text-foreground">{item.title}</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{item.detail}</span>
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
