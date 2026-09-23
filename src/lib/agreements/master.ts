export const AGREEMENT_VERSION = "2026-09-22";
export const AGREEMENT_VERSION_ID = "sjcc-msa-2026-09-22";
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
      "DOT drug and alcohol testing program administration",
      "Random testing pool administration",
      "FMCSA compliance support",
      "Driver qualification file support",
      "Clearinghouse assistance",
      "Background screening coordination",
      "Motor vehicle record (MVR) monitoring and review",
      "Compliance reminders and reporting",
      "Related administrative compliance services",
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
      "Sharing with collection sites, laboratories, medical review officers, consortiums, background and MVR providers, government agencies, regulatory systems, and other service providers reasonably necessary to perform the services",
    ],
  },
  {
    heading: "6. Fees and payment",
    paragraphs: [
      "Client agrees to pay the fees for services requested or provided. Fees may include monthly service fees, consortium membership, random testing, drug testing, alcohol testing, background screening, MVR, Clearinghouse, collection-site, administrative, setup, and other service charges.",
      "The current monthly service fee is seven U.S. dollars ($7.00) per driver who needs testing, billed monthly in advance. Stripe collects the first month before the portal opens. When Client adds a testing driver beyond the seats already paid, $7.00 for that seat is charged that day. Removing a driver does not refund the month already paid. The monthly amount then changes at the next billing period.",
      "One-off tests and vendor charges, including random, pre-employment, post-accident, reasonable-suspicion, return-to-duty, and follow-up tests, plus screening, MVR, and Clearinghouse charges, are charged to the payment method on file before the order is placed. SJCC does not advance those costs. Published one-off rates are $65.00 for a DOT drug test, $55.00 for a DOT breath alcohol test, $110.00 for a combined drug and alcohol test, and $15.00 for a motor vehicle record, unless a later notice states a different published rate. Fees may be updated upon prior notice.",
    ],
  },
  {
    heading: "7. Authorization to charge the payment method on file",
    paragraphs: [
      "Client expressly authorizes SJCC to charge any payment method kept on file for amounts due under this Agreement, without a separate approval for each transaction. Client will keep a valid payment method on file at all times.",
      "If a payment fails, SJCC may retry it, suspend services, and restrict account access. Outstanding balances stay immediately due. This authorization lasts until services end and every outstanding balance is paid.",
    ],
    bullets: [
      "The recurring $7.00 per testing driver per month, collected up front",
      "Random drug and alcohol testing events",
      "Post-accident, reasonable-suspicion, return-to-duty, follow-up, and pre-employment testing",
      "Background screening, MVR, Clearinghouse, regulatory, collection-site, and other third-party charges incurred for Client",
      "Administrative and other authorized service fees",
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

export const AGREEMENT_ACKNOWLEDGMENTS = [
  { name: "termsAccepted", label: "I have read and agree to this Master Service Agreement." },
  { name: "esignConsent", label: "I consent to electronic records and electronic signatures." },
  { name: "billingAuthorized", label: "I authorize SJCC to charge the payment method on file for the recurring $7.00 per testing driver per month, collected up front, and for one-off tests, random testing events, third-party charges, and other authorized fees described in this Agreement." },
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
