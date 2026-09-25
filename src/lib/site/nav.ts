export const NAV = [
  {
    label: "Program",
    links: [
      ["/", "Home"],
      ["/consortium", "Consortium"],
      ["/owner-operators", "Owner-operators"],
      ["/hire", "Hire screens"],
      ["/how-it-works", "How it works"],
      ["/service-area", "Service area"],
      ["/pricing", "Pricing"],
    ],
  },
  {
    label: "Testing",
    links: [
      ["/testing", "Testing"],
      ["/randoms", "Randoms"],
      ["/pre-employment", "Pre-employment"],
      ["/post-accident", "Post-accident"],
    ],
  },
  {
    label: "Records",
    links: [
      ["/mvr", "MVR"],
      ["/backgrounds", "Backgrounds"],
      ["/clearinghouse", "Clearinghouse"],
      ["/driver-files", "Driver files"],
      ["/physicals", "Physicals"],
    ],
  },
  {
    label: "Filings",
    links: [
      ["/filings", "Filings"],
      ["/boc-3", "BOC-3"],
      ["/ucr", "UCR"],
    ],
  },
  {
    label: "Company",
    links: [
      ["/about", "About"],
      ["/contact", "Contact"],
      ["/faq", "FAQ"],
      ["/legal", "Legal"],
    ],
  },
] as const;

export type NavHref = (typeof NAV)[number]["links"][number][0];
