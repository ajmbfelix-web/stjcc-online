export const SITE_URL = "https://stjcc.online";
export const SITE_NAME = "St. Joseph Compliance Company";
export const SITE_HANDLE = "stjcc.online";

export const DEFAULT_DESCRIPTION =
  "St. Joseph Compliance Company runs a per-company fleet program for small motor carriers and prepaid hire screens for staffing firms. Collection is at Quest and LabCorp sites through our testing partner.";

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
        "Fleet program for 2–20 testing drivers, each company its own random pool, and prepaid hire screens. SJCC does not sell a combined multi-employer pool.",
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
            text: "SJCC runs a fleet program for motor carriers with at least two testing drivers, and prepaid hire screens for staffing firms and offices. Each fleet is its own random pool.",
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
            text: "No. A one-driver company needs a consortium. SJCC does not run a pool of one and does not sell fleet seats to a single testing driver.",
          },
        },
      ],
    },
  ],
};
