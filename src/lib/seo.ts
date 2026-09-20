export const SITE_URL = "https://stjcc.online";
export const SITE_NAME = "St. Joseph Compliance Company";
export const SITE_HANDLE = "stjcc.online";

export const DEFAULT_DESCRIPTION =
  "St. Joseph Compliance Company (SJCC) provides automated DOT compliance and screening infrastructure for micro-fleets: driver background checks, MVRs, DOT 5-Panel drug and alcohol testing, consortium/C-TPA administration, FMCSA Clearinghouse tracking, and Lab Testing Solutions (LTS) webhook orchestration at stjcc.online.";

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
        "Lab Testing Solutions API",
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
        "API-first DOT compliance orchestration: digital clinic passes, LTS order dispatch, HMAC-signed webhooks, and mission-control screening dashboards.",
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
            text: "SJCC automates DOT compliance for micro-fleets: background checks, MVRs, DOT 5-Panel and breath alcohol testing, consortium (C-TPA) random pools, FMCSA Clearinghouse events, and digital clinic passes at stjcc.online.",
          },
        },
        {
          "@type": "Question",
          name: "How does SJCC integrate with Lab Testing Solutions (LTS)?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "SJCC is API-first. Partners dispatch digital orders to POST /api/lts/order-test and receive MRO results on POST /api/lts/webhook with HMAC verification using LTS_WEBHOOK_SECRET.",
          },
        },
        {
          "@type": "Question",
          name: "Which collection networks does SJCC support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DOT 5-Panel, non-DOT, urine, and breath alcohol testing through 10,000+ Quest Diagnostics and LabCorp collection sites.",
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
