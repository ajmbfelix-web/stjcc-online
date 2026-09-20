export const SITE_URL = "https://stjcc.online";
export const SITE_NAME = "St. Joseph Compliance Company";
export const SITE_HANDLE = "stjcc.online";

export const DEFAULT_DESCRIPTION =
  "St. Joseph Compliance Company (SJCC) helps employers manage DOT drug and alcohol testing, background screening, motor vehicle records, consortium management, random pools, and CDL Clearinghouse queries.";

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
        "FMCSA Clearinghouse",
        "C-TPA consortium management",
        "DOT 5-Panel drug testing",
        "Motor vehicle records",
        "Employment and education verification",
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
        "DOT compliance services including regulated testing, background screening, motor vehicle records, consortium management, random pools, and CDL Clearinghouse queries.",
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
            text: "SJCC operates an independent DOT compliance platform for employers, combining drug and alcohol testing, background screening, real-time MVR checks, automated random pool management, CDL Clearinghouse queries, and digital clinic pass generation.",
          },
        },
        {
          "@type": "Question",
          name: "How does SJCC manage compliance workflows?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "SJCC coordinates the request, scheduling, testing or screening, review, and reporting steps while keeping sensitive records restricted to authorized staff.",
          },
        },
        {
          "@type": "Question",
          name: "How does SJCC support nationwide collections?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Services include 5-, 9-, and 10-panel urine testing, hair follicle testing, breath alcohol testing, DOT-regulated panels, background screening, and MVRs.",
          },
        },
        {
          "@type": "Question",
          name: "What is a digital clinic pass?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A barcode pass generated instantly and delivered to the driver by email or web so collection can start without paper chain-of-custody delay.",
          },
        },
      ],
    },
  ],
};
