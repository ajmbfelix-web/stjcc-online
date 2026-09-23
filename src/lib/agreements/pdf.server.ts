import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { AGREEMENT_SECTIONS, AGREEMENT_TITLE, AGREEMENT_VERSION } from "./master.ts";

export type SignedAgreement = {
  organizationName: string;
  signerName: string;
  signerTitle: string;
  signerEmail: string;
  signatureName: string;
  acceptedAt: Date;
  ipAddress?: string;
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;

function wrap(text: string, font: { widthOfTextAtSize: (value: string, size: number) => number }, size: number, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderSignedAgreement(input: SignedAgreement): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.07, 0.07, 0.07);
  const muted = rgb(0.33, 0.33, 0.33);
  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const nextPage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  };
  const ensure = (height: number) => {
    if (y - height < MARGIN) nextPage();
  };
  const write = (text: string, options: { size?: number; font?: typeof font; color?: ReturnType<typeof rgb>; gap?: number }) => {
    const size = options.size ?? 10;
    const face = options.font ?? font;
    const gap = options.gap ?? 4;
    for (const line of wrap(text, face, size, PAGE_WIDTH - MARGIN * 2)) {
      ensure(size + gap);
      page.drawText(line, { x: MARGIN, y: y - size, size, font: face, color: options.color ?? ink });
      y -= size + gap;
    }
  };

  write("ST. JOSEPH COMPLIANCE COMPANY", { size: 11, font: bold, gap: 6 });
  write(AGREEMENT_TITLE, { size: 16, font: bold, gap: 8 });
  write(`Version ${AGREEMENT_VERSION}`, { size: 9, color: muted, gap: 14 });
  write(`This Agreement is entered into by St. Joseph Compliance Company, LLC and ${input.organizationName}.`, { gap: 12 });

  for (const section of AGREEMENT_SECTIONS) {
    write(section.heading, { size: 12, font: bold, gap: 6 });
    for (const paragraph of section.paragraphs) write(paragraph, { gap: 8 });
    for (const bullet of section.bullets ?? []) write(`•  ${bullet}`, { gap: 3 });
    y -= 8;
  }

  ensure(150);
  y -= 8;
  write("Electronic signature", { size: 12, font: bold, gap: 8 });
  const stamp = input.acceptedAt.toISOString();
  const rows = [
    `Company: ${input.organizationName}`,
    `Authorized representative: ${input.signerName}`,
    `Title: ${input.signerTitle}`,
    `Email: ${input.signerEmail}`,
    `Electronic signature: ${input.signatureName}`,
    `Date: ${stamp}`,
    `IP address: ${input.ipAddress || "not supplied by the network"}`,
    `Agreement version: ${AGREEMENT_VERSION}`,
  ];
  for (const row of rows) write(row, { gap: 4 });
  y -= 8;
  write("The signer checked every acknowledgment, including consent to electronic records and authorization to charge the payment method on file for the recurring $5.00 per testing driver per month and for one-off tests and other authorized fees.", { gap: 8 });

  return pdf.save();
}
