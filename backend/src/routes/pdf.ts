import { Router, Response } from "express";
import PDFDocument from "pdfkit";
import Agreement from "../models/Agreement";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

const router = Router();

// Layout constants
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const HEADER_TOP_Y = 55;
const FOOTER_SAFE_Y = PAGE_HEIGHT - 55;

const SECTION_GAP = 18;
const HEADING_GAP = 8;
const PARA_GAP = 12;
const ROW_PADDING_V = 6;
const ROW_MIN_HEIGHT = 22;

function measureRowHeight(
  doc: PDFKit.PDFDocument,
  value1: string,
  value2: string,
  colWidth: number
): number {
  doc.fontSize(8).font("Helvetica");
  const h1 = doc.heightOfString(value1 || "-", { width: colWidth });
  const h2 = doc.heightOfString(value2 || "-", { width: colWidth });
  return Math.max(h1, h2, ROW_MIN_HEIGHT - ROW_PADDING_V * 2) + ROW_PADDING_V * 2;
}

function drawRow(
  doc: PDFKit.PDFDocument,
  y: number,
  label1: string,
  value1: string,
  label2: string,
  value2: string
): number {
  const leftX = MARGIN;
  const midX = PAGE_WIDTH / 2 + 10;
  const labelColWidth = 90;
  const col1Width = midX - leftX - labelColWidth - 20;
  const col2Width = PAGE_WIDTH - MARGIN - midX - labelColWidth - 10;

  const rowHeight = measureRowHeight(doc, value1, value2, Math.min(col1Width, col2Width));
  const textY = y + ROW_PADDING_V;

  doc.fontSize(8).font("Helvetica-Bold").fillColor("#000000").text(label1, leftX, textY, { width: labelColWidth });
  doc.font("Helvetica").text(value1 || "-", leftX + labelColWidth, textY, { width: col1Width });

  if (label2) {
    doc.font("Helvetica-Bold").text(label2, midX, textY, { width: labelColWidth });
    doc.font("Helvetica").text(value2 || "-", midX + labelColWidth, textY, { width: col2Width });
  }

  const rowBottom = y + rowHeight;

  doc
    .moveTo(leftX, rowBottom)
    .lineTo(PAGE_WIDTH - MARGIN, rowBottom)
    .strokeColor("#dddddd")
    .lineWidth(0.5)
    .stroke();

  return rowBottom;
}

function drawPageHeader(doc: PDFKit.PDFDocument) {
  doc
    .moveTo(MARGIN, 30)
    .lineTo(PAGE_WIDTH - MARGIN, 30)
    .strokeColor("#1a5276")
    .lineWidth(1.5)
    .stroke();

  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#666666")
    .text("KOTA CARZ SELF DRIVE KOTA", MARGIN, 36, { align: "left" });

  doc.fillColor("#000000");
}

function drawPageFooter(doc: PDFKit.PDFDocument, pageNum: number, totalPages: number) {
  const footerY = PAGE_HEIGHT - 34;

  doc
    .moveTo(MARGIN, footerY - 6)
    .lineTo(PAGE_WIDTH - MARGIN, footerY - 6)
    .strokeColor("#1a5276")
    .lineWidth(1)
    .stroke();

  doc
    .fontSize(7)
    .font("Helvetica")
    .fillColor("#888888")
    .text("Kota Carz Self Drive Kota — Rental Agreement", MARGIN, footerY, { align: "left" });

  doc.text(`Page ${pageNum} of ${totalPages}`, MARGIN, footerY, {
    align: "right",
    width: CONTENT_WIDTH,
  });

  doc.fillColor("#000000");
}

function newPage(doc: PDFKit.PDFDocument): number {
  doc.addPage();
  drawPageHeader(doc);
  return HEADER_TOP_Y;
}

function ensureSpace(doc: PDFKit.PDFDocument, y: number, requiredHeight: number): number {
  if (y + requiredHeight > FOOTER_SAFE_Y) {
    return newPage(doc);
  }
  return y;
}

function drawSectionHeading(doc: PDFKit.PDFDocument, title: string, y: number): number {
  doc.fontSize(11).font("Helvetica-Bold");
  const titleHeight = doc.heightOfString(title, { width: CONTENT_WIDTH });
  const reserved = titleHeight + HEADING_GAP + 30;

  y = ensureSpace(doc, y, reserved);

  doc.fillColor("#1a5276").text(title, MARGIN, y, { width: CONTENT_WIDTH, lineBreak: false });

  const afterTitleY = y + titleHeight + 4;

  doc
    .moveTo(MARGIN, afterTitleY)
    .lineTo(PAGE_WIDTH - MARGIN, afterTitleY)
    .strokeColor("#1a5276")
    .lineWidth(0.8)
    .stroke();

  doc.fillColor("#000000");
  return afterTitleY + HEADING_GAP;
}

function drawParagraph(doc: PDFKit.PDFDocument, text: string, y: number, fontSize = 9): number {
  doc.fontSize(fontSize).font("Helvetica");
  const height = doc.heightOfString(text, { width: CONTENT_WIDTH });
  y = ensureSpace(doc, y, Math.min(height, 60));
  doc.fillColor("#000000").text(text, MARGIN, y, { width: CONTENT_WIDTH, lineBreak: true });
  return y + height + PARA_GAP;
}

function isValidSignatureImage(data: string): boolean {
  if (!data) return false;
  if (!data.startsWith("data:image")) return false;
  const parts = data.split(",");
  if (parts.length < 2) return false;
  const base64 = parts[1];
  if (!base64 || base64.length < 100) return false;
  return true;
}

function renderSignature(
  doc: PDFKit.PDFDocument,
  label: string,
  data: string,
  x: number,
  y: number,
  sigWidth: number,
  sigHeight: number
): number {
  doc.fontSize(9).font("Helvetica-Bold");
  const labelHeight = doc.heightOfString(label, { width: 200 });
  doc.fillColor("#333333").text(label, x, y, { lineBreak: false });
  const labelBottom = y + labelHeight + 6;

  if (isValidSignatureImage(data)) {
    try {
      const base64Data = data.split(",")[1];
      const imgBuffer = Buffer.from(base64Data, "base64");
      doc.image(imgBuffer, x, labelBottom, { width: sigWidth, height: sigHeight, fit: [sigWidth, sigHeight] });
      doc.fillColor("#000000");
      return labelBottom + sigHeight + 6;
    } catch {
      // Fall through to line
    }
  }

  doc.fillColor("#000000");
  doc
    .moveTo(x, labelBottom + sigHeight - 5)
    .lineTo(x + sigWidth, labelBottom + sigHeight - 5)
    .strokeColor("#999999")
    .lineWidth(0.5)
    .stroke();

  return labelBottom + sigHeight + 6;
}

// GET /api/agreements/:id/pdf
router.get(
  "/:id/pdf",
  authenticate,
  authorize("agreements_view"),
  async (req: AuthRequest, res: Response) => {
    try {
      const agreement = await Agreement.findById(req.params.id);
      if (!agreement) {
        res.status(404).json({ error: "Agreement not found" });
        return;
      }

      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 55, bottom: 55, left: MARGIN, right: MARGIN },
        bufferPages: true,
      });

      const filename = `${agreement.agreementNo}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      doc.pipe(res);

      // ===== PAGE 1 =====
      drawPageHeader(doc);

      let y = 50;

      const titleLine1 = "KOTA CARZ SELF DRIVE KOTA";
      doc.fontSize(18).font("Helvetica-Bold");
      doc.fillColor("#1a5276").text(titleLine1, MARGIN, y, { align: "center", width: CONTENT_WIDTH });
      y = y + doc.heightOfString(titleLine1, { width: CONTENT_WIDTH }) + 6;

      const titleLine2 = "RENTAL AGREEMENT";
      doc.fontSize(13).font("Helvetica-Bold");
      doc.fillColor("#333333").text(titleLine2, MARGIN, y, { align: "center", width: CONTENT_WIDTH });
      y = y + doc.heightOfString(titleLine2, { width: CONTENT_WIDTH }) + 6;

      const titleLine3 = "AGREEMENT FOR CAR HIRE (SELF DRIVE) BETWEEN HIRER AND OWNER";
      doc.fontSize(8).font("Helvetica");
      doc.fillColor("#666666").text(titleLine3, MARGIN, y, { align: "center", width: CONTENT_WIDTH });
      y = y + doc.heightOfString(titleLine3, { width: CONTENT_WIDTH }) + 12;

      doc
        .moveTo(MARGIN + 80, y)
        .lineTo(PAGE_WIDTH - MARGIN - 80, y)
        .strokeColor("#1a5276")
        .lineWidth(1.5)
        .stroke();

      y += 18;

      // Agreement intro
      y = drawParagraph(
        doc,
        `This document is drafted as a binding agreement between the hirer and the owner. Agreement No.: ${agreement.agreementNo}`,
        y
      );

      y += SECTION_GAP - PARA_GAP;

      // Section: Vehicle description and term hire
      y = drawSectionHeading(doc, "Vehicle description and term hire", y);

      // Table — top border
      doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).strokeColor("#cccccc").lineWidth(0.5).stroke();

      const rows: Array<[string, string, string, string]> = [
        ["Hire Name", agreement.hireName, "Father's Name", agreement.fatherName],
        ["Mobile No.", agreement.mobile, "Licence No.", agreement.licenceNo],
        ["Address", agreement.address, "", ""],
        ["Car Reg Number", agreement.carReg, "Car Model", agreement.carModel],
        ["Start Date", agreement.startDate, "Reporting Time", agreement.reportingTime],
        ["Expected Return", agreement.returnDate, "Return Time", agreement.returnTime],
        ["End Time", agreement.endTime, "Start KM", agreement.startKm],
        ["End KM", agreement.endKm, "Fuel Start/End", `${agreement.fuelStart || "-"} / ${agreement.fuelEnd || "-"}`],
      ];

      for (const [label1, value1, label2, value2] of rows) {
        const projectedHeight = measureRowHeight(doc, value1, value2, CONTENT_WIDTH / 2 - 100);
        if (y + projectedHeight > FOOTER_SAFE_Y) {
          y = newPage(doc);
          doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).strokeColor("#cccccc").lineWidth(0.5).stroke();
        }
        y = drawRow(doc, y, label1, value1, label2, value2);
      }

      y += SECTION_GAP;

      // Section: Payment by Hire
      y = drawSectionHeading(doc, "Payment by Hire", y);
      y = drawParagraph(
        doc,
        `The Hirer must pay the operator the sums specified in this agreement. Rental amount: INR ${agreement.rentalAmount.toLocaleString(
          "en-IN",
          { minimumFractionDigits: 2 }
        )}. ` +
          `Security deposit: INR ${agreement.securityDeposit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}. ` +
          `Payment mode: ${agreement.paymentMode || "-"}. Payment status: ${agreement.paymentStatus || "-"}. ` +
          `The security deposit may be applied toward necessary repair/replacement costs and other amounts due under this agreement.`,
        y
      );

      y += SECTION_GAP - PARA_GAP;

      // Section: Representation and Warranties
      y = drawSectionHeading(doc, "Representation and Warranties", y);
      y = drawParagraph(
        doc,
        "Owner represents and warrants that, to the owner's knowledge, the rental vehicle is in good condition and safe for ordinary operation. " +
          "The hirer represents that the hirer is legally entitled to operate a motor vehicle under applicable law and will not operate it in violation of law or in a negligent or illegal manner. " +
          "The hirer has an opportunity to examine the rental vehicle before taking possession and is responsible for damage occurring during the hire period except damage noted in the separate existing-damage document.",
        y
      );

      y += SECTION_GAP - PARA_GAP;

      // Section: Jurisdiction and Venue
      y = drawSectionHeading(doc, "Jurisdiction and Venue", y);
      y = drawParagraph(
        doc,
        "In the event of a dispute over this agreement, it will be interpreted according to the applicable laws of the State of Rajasthan, with Kota as the agreed venue, subject to applicable law.",
        y
      );

      // ===== Continued content flows naturally — no forced page break =====

      y += SECTION_GAP - PARA_GAP;

      y = drawSectionHeading(doc, "Entire Agreement", y);
      y = drawParagraph(
        doc,
        "This Car Rental Agreement constitutes the entire agreement between the parties with respect to this rental agreement. Modification can be made only in writing and signed by the parties.",
        y
      );

      y += SECTION_GAP - PARA_GAP;

      y = drawSectionHeading(doc, "NOTE", y);
      y = drawParagraph(
        doc,
        "If you want to return the car before the end time of your rental period, no amount will be refunded unless otherwise agreed. " +
          "If you need an extra day, contact the rental team before the scheduled return time and ask whether the vehicle is available.",
        y
      );

      y += SECTION_GAP - PARA_GAP;

      y = drawSectionHeading(
        doc,
        "SCHEDULE OF CHARGES AND TERMS AND CONDITIONS FOR VEHICLE ON SELF DRIVE BASIS",
        y
      );

      const terms = [
        "1. Driving above the mentioned maximum speed of 80 km/hr: fine of INR 2500.",
        "2. Tyre misuse or damage resulting from bad terrain/continued driving after a puncture: actual tyre cost may be charged.",
        "3. Traffic violation: INR 1000 in addition to the actual fine charged.",
        "4. Unauthorized activities such as carrying arms/ammunition or intoxication: INR 15000 penalty.",
        "5. Tampering with GPS, speed governor or similar devices: INR 15000 plus actual repair/fitment cost.",
        "6. Delay in returning the car: INR 300 per hour over the agreed hour rate; after extension, INR 500 per day may apply.",
        "7. Extension beyond scheduled time must be informed in advance and is subject to availability; otherwise a whole-day charge may apply.",
        "8. Unclean car: INR 500 for minor cleaning and INR 1500 for major cleaning.",
        "9. Failure to return original documents: INR 5000 plus actual documentation charges.",
        "10. Driving under the influence of alcohol/drugs or while suffering from a condition that makes driving unsafe may result in forfeiture of the security deposit plus actual damage costs.",
        "11. Intentional damage, continuing to drive after an accident, or extreme/rash driving is prohibited and may result in liability for damage.",
        "12. Carrying more persons than legally permitted: INR 5000 penalty, plus liability for resulting legal action.",
        "13. Carrying any animal illegally: INR 20000 penalty.",
        "14. Smoking: INR 1000 plus applicable interior damage charges.",
        "15. Carrying passengers or goods for consideration/reward, whether expressed or implied, is prohibited.",
        "16. Vehicle may be supplied with limited fuel as agreed. Fuel shortage on return may be charged at the applicable fuel rate.",
        "17. Damage repair charges will be based on authorized service-center estimates. Insurance treatment is subject to the applicable policy and circumstances.",
        "18. Security amount will normally be returned within 3 to 7 working days, subject to resolution of issues and applicable deductions.",
        "19. Early return does not automatically entitle the hirer to a refund or adjustment unless agreed in writing.",
        "20. Indicative fixed damage charges: minimum scratch INR 1000; dent/panel paint work INR 4000; bumper damage INR 8000; wheel cap missing INR 500; side mirror INR 5000; running board INR 2000; number plate INR 500; tail lamp INR 3000; tyre damage INR 5000; tyre puncture INR 200.",
        "21. Repairing the car without permission of the operator may attract a penalty of INR 10000.",
      ];

      const TERM_GAP = 6;
      doc.fontSize(8.5).font("Helvetica");
      for (const term of terms) {
        const termHeight = doc.heightOfString(term, { width: CONTENT_WIDTH });
        y = ensureSpace(doc, y, termHeight + TERM_GAP);
        doc.fillColor("#000000").text(term, MARGIN, y, { width: CONTENT_WIDTH, lineBreak: true });
        y = y + termHeight + TERM_GAP;
      }

      y += SECTION_GAP - PARA_GAP;

      // Confirmation line
      y = drawParagraph(
        doc,
        "I have read carefully all terms and conditions above mentioned and I agree to the liability and terms and conditions.",
        y
      );

      y += 10;

      // ===== SIGNATURES SECTION =====
      const sigWidth = 180;
      const sigHeight = 50;
      const sigBoxHeight = 100;

      y = ensureSpace(doc, y, sigBoxHeight + 60);

      const sigBoxTop = y;

      doc.roundedRect(MARGIN, sigBoxTop, CONTENT_WIDTH, sigBoxHeight, 3).fillColor("#f5f8fa").fill();
      doc
        .roundedRect(MARGIN, sigBoxTop, CONTENT_WIDTH, sigBoxHeight, 3)
        .strokeColor("#1a5276")
        .lineWidth(0.8)
        .stroke();

      const sigLabelY = sigBoxTop + 14;

      const custBottom = renderSignature(
        doc,
        "Hirer Signature:",
        agreement.customerSignature,
        MARGIN + 14,
        sigLabelY,
        sigWidth,
        sigHeight
      );

      const witnessX = PAGE_WIDTH / 2 + 10;
      const witBottom = renderSignature(
        doc,
        "Witness Signature:",
        agreement.witnessSignature,
        witnessX,
        sigLabelY,
        sigWidth,
        sigHeight
      );

      y = Math.max(custBottom, witBottom, sigBoxTop + sigBoxHeight) + 20;

      doc.fontSize(9).font("Helvetica");
      const LINE_GAP = 8;

      const witnessNameLine = `Witness Name: ${agreement.witnessName || "____________________"}`;
      doc.fillColor("#000000").text(witnessNameLine, MARGIN, y, { width: CONTENT_WIDTH, lineBreak: false });
      y = y + doc.heightOfString(witnessNameLine, { width: CONTENT_WIDTH }) + LINE_GAP;

      const mobileDateLine = `Mobile: ${agreement.mobile || ""}    Date: ${
        agreement.createdAt ? new Date(agreement.createdAt).toLocaleDateString("en-IN") : ""
      }`;
      doc.text(mobileDateLine, MARGIN, y, { width: CONTENT_WIDTH, lineBreak: false });
      y = y + doc.heightOfString(mobileDateLine, { width: CONTENT_WIDTH }) + LINE_GAP;

      const thumbLine = "Hirer Thumb Print: ____________________    Witness Thumb Print: ____________________";
      doc.text(thumbLine, MARGIN, y, { width: CONTENT_WIDTH, lineBreak: false });
      y = y + doc.heightOfString(thumbLine, { width: CONTENT_WIDTH }) + SECTION_GAP;

      // Notes/inspection
      if (agreement.notes) {
        y = drawSectionHeading(doc, "Inspection Notes", y);
        y = drawParagraph(doc, agreement.notes, y);
      }

      // Draw footer on all pages
      const range = doc.bufferedPageRange();
      const totalPages = range.count;
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        drawPageFooter(doc, i - range.start + 1, totalPages);
      }

      doc.end();
    } catch (error) {
      console.error("PDF generation error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to generate PDF" });
      }
    }
  }
);

export default router;
