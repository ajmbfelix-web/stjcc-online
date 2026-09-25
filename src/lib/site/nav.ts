export const NAV = [
  {
    label: "Program",
    links: [
      ["/", "Home"],
      ["/consortium", "Consortium"],
      ["/owner-operators", "Owner-operators"],
      ["/hire", "Hire screens"],
      ["/services", "All services"],
      ["/how-it-works", "How it works"],
      ["/service-area", "Service area"],
      ["/pricing", "Pricing"],
    ],
  },
  {
    label: "Testing",
    links: [
      ["/testing", "Testing"],
      ["/dot-urine", "DOT urine"],
      ["/non-dot", "Non-DOT panels"],
      ["/breath-alcohol", "Breath alcohol"],
      ["/hair", "Hair"],
      ["/randoms", "Randoms"],
      ["/pre-employment", "Pre-employment"],
      ["/post-accident", "Post-accident"],
      ["/reasonable-suspicion", "Reasonable suspicion"],
      ["/return-to-duty", "Return to duty"],
    ],
  },
  {
    label: "Records",
    links: [
      ["/mvr", "MVR"],
      ["/psp", "PSP"],
      ["/backgrounds", "Backgrounds"],
      ["/clearinghouse", "Clearinghouse"],
      ["/driver-files", "Driver files"],
      ["/physicals", "Physicals"],
      ["/supervisor-training", "Supervisor training"],
      ["/policy", "Written policy"],
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
