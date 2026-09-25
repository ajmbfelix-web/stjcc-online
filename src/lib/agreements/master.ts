export const AGREEMENT_VERSION = "2026-09-24";
export const AGREEMENT_VERSION_ID = "sjcc-msa-2026-09-24";
export const AGREEMENT_TITLE = "Master Service Agreement, Electronic Consent, and Payment Authorization";

export type AgreementSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export const AGREEMENT_SECTIONS: AgreementSection[] = [
  {
    heading: "1. Purpose",
    paragraphs: [
      "St. Joseph Compliance Company, LLC (\"SJCC\") provides administrative compliance support for employers and transportation companies. This Master Service Agreement (\"Agreement\") is between SJCC and the company that signs it (\"Client\").",
      "By electronically signing, Client agrees to every term in this Agreement. SJCC may modify, expand, or improve its services from time to time. A change to fees takes effect only after notice to Client.",
    ],
    bullets: [
      "DOT drug and alcohol testing, collected at Quest and LabCorp sites through SJCC's testing partner",
      "One SJCC consortium for accepted fleets of two or more testing drivers, drawn at 50 percent drug and 10 percent alcohol of the combined pool",
      "A private company file. Other members' drivers are not shown in Client's portal",
      "A certificate of enrollment after the annual membership is paid and the roster is on file",
      "FMCSA recordkeeping support. SJCC does not file Clearinghouse reports unless Client designates SJCC and that designation is accepted in the federal system",
      "Motor vehicle record orders",
      "Compliance reminders and reporting",
      "Related administrative services SJCC actually offers",
    ],
  },
  {
    heading: "2. Client responsibilities",
    paragraphs: [
      "Client remains solely responsible for compliance with applicable federal, state, and local laws. Client shall:",
    ],
    bullets: [
      "Provide complete, accurate, and current information",
      "Maintain required driver and employee records",
      "Promptly notify SJCC of hires, terminations, leaves of absence, and status changes",
      "Report accidents, violations, and other compliance events when required",
      "Respond to requests for information in a timely manner",
      "Maintain the licenses, permits, registrations, and operating authority required by law",
      "Review the reports and notifications SJCC sends",
    ],
  },
  {
    heading: "3. No legal or regulatory advice",
    paragraphs: [
      "SJCC is not a law firm and does not provide legal advice. Information, recommendations, reports, reminders, notices, and other communications from SJCC are administrative. They are not legal advice. Client should consult qualified legal counsel on legal or regulatory questions.",
    ],
  },
  {
    heading: "4. No guarantee of regulatory compliance",
    paragraphs: [
      "SJCC assists with compliance administration and recordkeeping. SJCC does not guarantee regulatory compliance, audit outcomes, inspection outcomes, enforcement decisions, government determinations, or driver eligibility. Ultimate responsibility for compliance stays with Client.",
    ],
  },
  {
    heading: "5. Data authorization",
    paragraphs: [
      "Client authorizes SJCC to collect, store, process, transmit, and share the information needed to perform this Agreement, and to use commercially reasonable measures to protect it.",
    ],
    bullets: [
      "Company, employee, driver, and contact information",
      "Drug and alcohol testing records",
      "Clearinghouse, MVR, background screening, and other compliance records",
      "Sharing with SJCC's testing partner, its collection sites, laboratories, and medical review officers, background and MVR providers, government agencies, and other service providers reasonably necessary to perform the services",
    ],
  },
  {
    heading: "6. Fees and payment",
    paragraphs: [
      "Client agrees to pay the fees for services requested or provided. Fees may include the annual consortium membership, prepaid drug testing, prepaid alcohol testing, motor vehicle records, and administrative charges. Membership is the pool, the company file, and the certificate. It is not unlimited collections. Setup is $0.00.",
      "The fleet consortium membership is two hundred ninety-nine U.S. dollars ($299.00) per year for an accepted fleet, with unlimited testing drivers on that roster. Stripe collects the year before the portal opens. Adding or removing a testing driver does not change that annual amount and is not a separate seat charge. A company with one testing driver cannot enroll and cannot pay this fee.",
      "Tests are charged to the payment method on file before the order is placed. SJCC does not advance those costs. A DOT urine drug test is $73.00. A DOT breath alcohol test is $63.00. Drug and breath alcohol at the same visit are $129.00. An observed or follow-up DOT drug test is $109.00. A motor vehicle record is $19.00 plus the state DMV fee. Other published catalog rates apply only to products SJCC is actually selling. Fees may be updated upon prior notice.",
    ],
  },
  {
    heading: "7. Authorization to charge the payment method on file",
    paragraphs: [
      "Client expressly authorizes SJCC to charge any payment method kept on file for amounts due under this Agreement, without a separate approval for each transaction. Client will keep a valid payment method on file at all times.",
      "If a payment fails, SJCC may retry it, suspend services, and restrict account access. Outstanding balances stay immediately due. This authorization lasts until services end and every outstanding balance is paid.",
    ],
    bullets: [
      "The $299.00 annual fleet consortium membership, when this enrollment is a fleet",
      "Prepaid drug tests, alcohol tests, same-visit pairs, and motor vehicle records",
      "Administrative and other authorized service fees that are live on the SJCC catalog",
    ],
  },
  {
    heading: "8. Electronic communications",
    paragraphs: [
      "Client consents to electronic communications, including service notices, billing notices, compliance reminders, reports, regulatory updates, contract updates, and account messages. Email to the address on file is effective notice.",
    ],
  },
  {
    heading: "9. Electronic signature consent",
    paragraphs: [
      "Client consents to electronic records and electronic signatures under the Electronic Signatures in Global and National Commerce Act (ESIGN), the Uniform Electronic Transactions Act (UETA), and other applicable law. Electronic signatures have the same effect as handwritten signatures. Electronic records satisfy legal recordkeeping requirements. Electronic acceptance creates a binding contract. SJCC may retain the electronic record of this Agreement and of later transactions.",
    ],
  },
  {
    heading: "10. Term and termination",
    paragraphs: [
      "This Agreement stays in effect until terminated. Either party may terminate it by written notice, including email. Termination does not erase outstanding balances, charges already incurred, testing already performed, regulatory obligations, or the sections that by their nature survive.",
      "SJCC may suspend or end services immediately for nonpayment, fraud, misuse, or a material breach.",
    ],
  },
  {
    heading: "11. Indemnification",
    paragraphs: [
      "Client will defend, indemnify, and hold harmless SJCC and its owners, officers, employees, contractors, and affiliates from claims, liabilities, damages, losses, penalties, fines, costs, and expenses arising from Client's violation of law, inaccurate information Client supplies, Client's failure to meet a regulatory obligation, acts or omissions of Client's employees or contractors, or misuse of the services.",
    ],
  },
  {
    heading: "12. Limitation of liability",
    paragraphs: [
      "To the maximum extent permitted by law, SJCC is not liable for indirect, incidental, consequential, punitive, special, or exemplary damages. SJCC's total cumulative liability arising from this Agreement will not exceed the amount Client paid SJCC during the twelve months immediately before the event giving rise to the claim.",
    ],
  },
  {
    heading: "13. Governing law",
    paragraphs: [
      "Michigan law governs this Agreement, without regard to conflict-of-law rules. A legal proceeding arising from it will be brought in a court of competent jurisdiction in Michigan.",
    ],
  },
  {
    heading: "14. Entire agreement",
    paragraphs: [
      "This Agreement is the entire agreement between the parties on this subject and supersedes prior discussions and agreements about it. A modification is effective only if SJCC makes it in writing.",
    ],
  },
];

export const HIRE_BILLING_LABEL =
  "I authorize SJCC to charge the payment method on file only for prepaid screens I order. This enrollment has no annual membership and is not in the consortium.";

export const HIRE_ADDENDUM: AgreementSection[] = [
  {
    heading: "15. Hire-screen addendum",
    paragraphs: [
      "If Client enrolled through the hire-screen path, this addendum controls over any conflicting membership or consortium term above.",
      "SJCC will not charge the annual consortium membership and will not place Client in the random pool. Client pays only for prepaid catalog screens that are live, ordered for a named person. Collection is at Quest and LabCorp sites through SJCC's testing partner. SJCC does not file Clearinghouse reports under this addendum.",
    ],
  },
];

export function agreementSections(program: "fleet" | "hire" = "fleet"): AgreementSection[] {
  return program === "hire" ? [...AGREEMENT_SECTIONS, ...HIRE_ADDENDUM] : AGREEMENT_SECTIONS;
}

export function agreementAcknowledgments(program: "fleet" | "hire" = "fleet") {
  if (program === "fleet") return AGREEMENT_ACKNOWLEDGMENTS;
  return AGREEMENT_ACKNOWLEDGMENTS.map((item) =>
    item.name === "billingAuthorized" ? { ...item, label: HIRE_BILLING_LABEL } : item,
  );
}

export const AGREEMENT_ACKNOWLEDGMENTS = [
  { name: "termsAccepted", label: "I have read and agree to this Master Service Agreement." },
  { name: "esignConsent", label: "I consent to electronic records and electronic signatures." },
  { name: "billingAuthorized", label: "I authorize SJCC to charge the payment method on file for the $299.00 annual fleet consortium membership, for prepaid tests, and for other authorized fees described in this Agreement. Membership is not unlimited collections." },
  { name: "complianceAcknowledged", label: "I understand that regulatory compliance remains my company's responsibility." },
  { name: "authorityConfirmed", label: "I represent that I am authorized to enter into this Agreement on behalf of the company." },
] as const;

export type AgreementAcceptance = {
  termsAccepted: boolean;
  esignConsent: boolean;
  billingAuthorized: boolean;
  complianceAcknowledged: boolean;
  authorityConfirmed: boolean;
  signatureName: string;
  signerTitle: string;
};

export function masterAgreementBody(): string {
  const lines = [
    "ST. JOSEPH COMPLIANCE COMPANY",
    AGREEMENT_TITLE,
    `Version ${AGREEMENT_VERSION}`,
    "",
    ...AGREEMENT_SECTIONS.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      ...(section.bullets ?? []).map((item) => `- ${item}`),
      "",
    ]),
  ];
  return lines.join("\n");
}

export function agreementBlocker(input: AgreementAcceptance): string | null {
  if (!input.termsAccepted || !input.esignConsent || !input.billingAuthorized || !input.complianceAcknowledged || !input.authorityConfirmed) {
    return "Every acknowledgment under the agreement is required";
  }
  if (input.signatureName.trim().length < 2) return "Type your full name as the electronic signature";
  if (input.signerTitle.trim().length < 2) return "Your title is required";
  return null;
}
