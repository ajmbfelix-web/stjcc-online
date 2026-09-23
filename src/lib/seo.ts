export const SITE_URL = "https://stjcc.online";
export const SITE_NAME = "St. Joseph Compliance Company";
export const SITE_HANDLE = "stjcc.online";

export const DEFAULT_DESCRIPTION =
  "St. Joseph Compliance Company runs per-company DOT random testing and orders drug, alcohol, background, and motor vehicle record work through Lab Testing Solutions.";

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
        "Per-company random testing",
        "DOT urine drug testing",
        "Breath alcohol testing",
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
        "Per-company random testing and LTS-fulfilled drug, alcohol, background, and motor vehicle record orders. SJCC does not sell a combined multi-employer pool.",
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
            text: "SJCC runs each employer's random program separately and orders drug, alcohol, background, and motor vehicle record work through Lab Testing Solutions.",
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
            text: "DOT urine drug tests, breath alcohol, non-DOT urine panels, hair, background screens, and motor vehicle records, fulfilled through LTS.",
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
