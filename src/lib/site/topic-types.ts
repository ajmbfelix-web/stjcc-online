import type { Sku } from "@/lib/billing/catalog";

export type StepIcon = "clipboard" | "flask" | "pin" | "file" | "bell" | "shield" | "user" | "scale";

export type TopicBlock = {
  h?: string;
  p?: string[];
  list?: string[];
  prices?: readonly Sku[];
  soon?: boolean;
};

export type Topic = {
  eyebrow: string;
  title: string;
  lede: string;
  description: string;
  blocks: TopicBlock[];
  steps?: { icon: StepIcon; title: string; body: string }[];
  faqs?: { q: string; a: string }[];
  cites?: { label: string; href: string }[];
  related?: { href: string; label: string }[];
  referral?: boolean;
  contactOnly?: boolean;
  orderHref?: string;
};
