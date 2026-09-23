import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  return (
    <OwnerFrame title="The book." lede="Seats on file plus tests paid this month. Prepaid tests are not treated as money owed to the lab. Vendor cost is an estimate until Labcorp’s invoice is connected.">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {book ? (
        <>
          <MoneyTiles book={book} />
          <p className="text-sm text-muted-foreground">Monthly seats on file: ${(book.seatBookCents / 100).toFixed(2)}. That amount is the contracted book, collected up front at signup and when a driver is added. A failed card shows under cards failing and does not order a test.</p>
        </>
      ) : null}
    </OwnerFrame>
  );
}
