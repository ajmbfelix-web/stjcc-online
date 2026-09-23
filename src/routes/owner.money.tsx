import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MoneyTiles, OwnerFrame, ownerHeaders } from "@/components/owner-frame";
import { SignInGate } from "@/lib/auth/gates";
import { pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/owner/money")({
  head: () => ({ meta: [{ title: pageTitle("Money") }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => (
    <SignInGate>
      <MoneyPage />
    </SignInGate>
  ),
});

type Book = { collectedThisMonthCents: number; prepaidCents: number; estimatedVendorCents: number; retainedCents: number; awaitingCharge: number; paidNotSent: number; pastDueClients: number; seatBookCents: number };

function dollars(cents: number) {
  return Math.round(cents / 100);
}

function MoneyPage() {
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void fetch("/api/owner/desk", { headers: ownerHeaders(), credentials: "include" })
      .then(async (response) => {
        const json = (await response.json()) as { book?: Book; error?: string };
        if (!response.ok || !json.book) throw new Error(json.error ?? "Money unavailable");
        setBook(json.book);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Money unavailable"));
  }, []);
  const rows = book
    ? [
        { name: "Collected", dollars: dollars(book.collectedThisMonthCents) },
        { name: "Prepaid", dollars: dollars(book.prepaidCents) },
        { name: "Lab estimate", dollars: dollars(book.estimatedVendorCents) },
        { name: "Kept", dollars: dollars(book.retainedCents) },
      ]
    : [];
  return (
    <OwnerFrame title="The book." lede="Collected is seats on file plus tests paid this month. Prepaid tests are not treated as money owed to the lab. Vendor cost stays an estimate until a real laboratory invoice is connected.">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {book ? (
        <>
          <MoneyTiles book={book} />
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="px-2 text-2xl">Where the month sits</h2>
            <p className="px-2 pb-3 text-sm text-muted-foreground">Dollars. Prepaid is still yours until the laboratory accepts the order.</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows}>
                  <XAxis dataKey="name" stroke="var(--color-subtle)" fontSize={12} />
                  <YAxis stroke="var(--color-subtle)" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="dollars" fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          <p className="text-sm text-muted-foreground">Monthly seats on file: ${(book.seatBookCents / 100).toFixed(2)}. That amount is the contracted book, collected up front at signup and when a driver is added. A failed card shows under cards failing and does not order a test.</p>
        </>
      ) : null}
    </OwnerFrame>
  );
}
