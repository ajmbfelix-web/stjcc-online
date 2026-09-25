export const SITE_URL = "https://stjcc.online";
export const SITE_NAME = "St. Joseph Compliance Company";
export const SITE_HANDLE = "stjcc.online";

export const DEFAULT_DESCRIPTION =
  "St. Joseph Compliance Company runs one consortium for fleets of two or more testing drivers, and prepaid hire screens. $299 per year. DOT urine $73. Breath alcohol $63. Southeast Michigan, with Quest and LabCorp collection through our testing partner.";

export function canonical(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return SITE_URL;
  return `${SITE_URL}${normalized}`;
}

export function pageTitle(page?: string) {
  return page ? `${page} · ${SITE_NAME}` : SITE_NAME;
}

export const jsonLdGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: ["SJCC", "St. Joseph Compliance"],
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
      email: "contact@stjcc.online",
      sameAs: [SITE_URL],
      areaServed: "United States",
      knowsAbout: [
        "DOT compliance",
        "Consortium random testing",
        "Hire screening",
        "DOT urine drug testing",
        "Breath alcohol testing",
        "Motor vehicle records",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#platform`,
      name: "SJCC DOT Compliance Platform",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      provider: { "@id": `${SITE_URL}/#organization` },
      description:
        "One consortium for fleets of two or more testing drivers, private company files, and prepaid hire screens. One-driver carriers are referred and are not charged.",
      offers: {
        "@type": "Offer",
        url: `${SITE_URL}/contact`,
        availability: "https://schema.org/OnlineOnly",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What does St. Joseph Compliance Company do?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "SJCC runs one random consortium for motor carriers with at least two testing drivers, and prepaid hire screens for staffing firms and offices. Each member's portal shows only that company's drivers.",
          },
        },
        {
          "@type": "Question",
          name: "How does SJCC manage compliance workflows?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "An order is paid on SJCC, the person gets instructions, collection happens at a Quest or LabCorp site, and the result returns to the SJCC portal.",
          },
        },
        {
          "@type": "Question",
          name: "Where are tests collected?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "At Quest and LabCorp sites through SJCC's testing partner. SJCC is based in Southeast Michigan and does not claim those clinics as its own.",
          },
        },
        {
          "@type": "Question",
          name: "Does SJCC enroll a one-driver company?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. A pool of one is not valid. SJCC refers that carrier out and does not charge a membership.",
          },
        },
      ],
    },
  ],
};
