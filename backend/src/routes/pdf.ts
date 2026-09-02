import { Router, Response } from "express";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import Agreement from "../models/Agreement";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

const router = Router();
const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// Helper: draw a table row
function drawRow(
  doc: PDFKit.PDFDocument,
  y: number,
  label1: string,
  value1: string,
  label2: string,
  value2: string,
  pageWidth: number
): number {
  const leftX = 50;
  const midX = pageWidth / 2 + 10;
  const rowHeight = 22;

  doc.fontSize(8).font("Helvetica-Bold").text(label1, leftX, y, { width: 90 });
  doc.font("Helvetica").text(value1 || "-", leftX + 90, y, { width: midX - leftX - 110 });
  doc.font("Helvetica-Bold").text(label2, midX, y, { width: 90 });
  doc.font("Helvetica").text(value2 || "-", midX + 90, y, { width: pageWidth - midX - 110 });

  // Draw lines
  doc.moveTo(leftX, y + rowHeight).lineTo(pageWidth - 50, y + rowHeight).strokeColor("#cccccc").lineWidth(0.5).stroke();

  return y + rowHeight;
}

// GET /api/agreements/:id/pdf - Generate and download PDF
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

      const pageWidth = 595.28; // A4 width in points
      const pageHeight = 841.89;
      const margin = 50;

      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 40, bottom: 40, left: margin, right: margin },
        bufferPages: true,
      });

      // Set response headers for PDF download
      const filename = `${agreement.agreementNo}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      // Pipe PDF to response
      doc.pipe(res);

      // ===== PAGE 1 =====
      // Title
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("KOTA CARZ SELF DRIVE KOTA", margin, 50, {
          align: "center",
          width: pageWidth - margin * 2,
        });

      doc
        .fontSize(12)
        .text("RENTAL AGREEMENT", { align: "center" })
        .moveDown(0.3);

      doc
        .fontSize(8)
        .font("Helvetica")
        .text(
          "AGREEMENT FOR CAR HIRE (SELF DRIVE) BETWEEN HIRER AND OWNER",
          { align: "center" }
        )
        .moveDown(0.8);

      // Agreement intro
      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          `This document is drafted as a binding agreement between the hirer and the owner. Agreement No.: ${agreement.agreementNo}`,
          margin,
          doc.y,
          { width: pageWidth - margin * 2 }
        )
        .moveDown(1);

      // Section: Vehicle description and term hire
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("Vehicle description and term hire", margin, doc.y)
        .moveDown(0.5);

      // Table
      let y = doc.y;
      const tableTop = y;

      // Draw table border
      doc.rect(margin, tableTop, pageWidth - margin * 2, 0).strokeColor("#cccccc").lineWidth(0.5).stroke();

      y = drawRow(doc, y, "Hire Name", agreement.hireName, "Father's Name", agreement.fatherName, pageWidth);
      y = drawRow(doc, y, "Mobile No.", agreement.mobile, "Licence No.", agreement.licenceNo, pageWidth);
      y = drawRow(doc, y, "Address", agreement.address, "", "", pageWidth);
      y = drawRow(doc, y, "Car Reg Number", agreement.carReg, "Car Model", agreement.carModel, pageWidth);
      y = drawRow(doc, y, "Start Date", agreement.startDate, "Reporting Time", agreement.reportingTime, pageWidth);
      y = drawRow(doc, y, "Expected Return", agreement.returnDate, "Return Time", agreement.returnTime, pageWidth);
      y = drawRow(doc, y, "End Time", agreement.endTime, "Start KM", agreement.startKm, pageWidth);
      y = drawRow(doc, y, "End KM", agreement.endKm, "Fuel Start/End", `${agreement.fuelStart || "-"} / ${agreement.fuelEnd || "-"}`, pageWidth);

      doc.moveDown(1);

      // Section: Payment by Hire
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("Payment by Hire", margin, doc.y)
        .moveDown(0.5);

      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          `The Hirer must pay the operator the sums specified in this agreement. Rental amount: INR ${agreement.rentalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}. ` +
          `Security deposit: INR ${agreement.securityDeposit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}. ` +
          `Payment mode: ${agreement.paymentMode || "-"}. Payment status: ${agreement.paymentStatus || "-"}. ` +
          `The security deposit may be applied toward necessary repair/replacement costs and other amounts due under this agreement.`,
          margin,
          doc.y,
          { width: pageWidth - margin * 2 }
        )
        .moveDown(1);

      // Section: Representation and Warranties
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("Representation and Warranties", margin, doc.y)
        .moveDown(0.5);

      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          "Owner represents and warrants that, to the owner's knowledge, the rental vehicle is in good condition and safe for ordinary operation. " +
          "The hirer represents that the hirer is legally entitled to operate a motor vehicle under applicable law and will not operate it in violation of law or in a negligent or illegal manner. " +
          "The hirer has an opportunity to examine the rental vehicle before taking possession and is responsible for damage occurring during the hire period except damage noted in the separate existing-damage document.",
          margin,
          doc.y,
          { width: pageWidth - margin * 2 }
        )
        .moveDown(1);

      // Section: Jurisdiction and Venue
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("Jurisdiction and Venue", margin, doc.y)
        .moveDown(0.5);

      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          "In the event of a dispute over this agreement, it will be interpreted according to the applicable laws of the State of Rajasthan, with Kota as the agreed venue, subject to applicable law.",
          margin,
          doc.y,
          { width: pageWidth - margin * 2 }
        )
        .moveDown(1.5);

      // ===== PAGE 2 =====
      doc.addPage();

      // Section: Entire Agreement
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("Entire Agreement", margin, 50)
        .moveDown(0.5);

      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          "This Car Rental Agreement constitutes the entire agreement between the parties with respect to this rental agreement. Modification can be made only in writing and signed by the parties.",
          margin,
          doc.y,
          { width: pageWidth - margin * 2 }
        )
        .moveDown(1);

      // Section: NOTE
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("NOTE", margin, doc.y)
        .moveDown(0.5);

      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          "If you want to return the car before the end time of your rental period, no amount will be refunded unless otherwise agreed. " +
          "If you need an extra day, contact the rental team before the scheduled return time and ask whether the vehicle is available.",
          margin,
          doc.y,
          { width: pageWidth - margin * 2 }
        )
        .moveDown(1);

      // Section: SCHEDULE OF CHARGES AND TERMS
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("SCHEDULE OF CHARGES AND TERMS AND CONDITIONS FOR VEHICLE ON SELF DRIVE BASIS", margin, doc.y)
        .moveDown(0.8);

      // Terms and conditions
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

      for (const term of terms) {
        doc
          .fontSize(8.5)
          .font("Helvetica")
          .text(term, margin, doc.y, { width: pageWidth - margin * 2 })
          .moveDown(0.3);
      }

      doc.moveDown(1);

      // Confirmation
      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          "I have read carefully all terms and conditions above mentioned and I agree to the liability and terms and conditions.",
          margin,
          doc.y,
          { width: pageWidth - margin * 2 }
        )
        .moveDown(1.5);

      // Signatures
      const sigY = doc.y;
      const sigWidth = 180;

      // Customer signature
      doc.fontSize(9).font("Helvetica").text("Hirer Signature:", margin, sigY);
      if (agreement.customerSignature && agreement.customerSignature.startsWith("data:image")) {
        try {
          const base64Data = agreement.customerSignature.split(",")[1];
          const imgBuffer = Buffer.from(base64Data, "base64");
          doc.image(imgBuffer, margin, sigY + 15, { width: sigWidth, height: 50 });
        } catch {
          doc.text("____________________", margin, sigY + 15);
        }
      } else {
        doc.text("____________________", margin, sigY + 15);
      }

      // Witness signature
      const witnessX = pageWidth / 2 + 10;
      doc.fontSize(9).font("Helvetica").text("Witness Signature:", witnessX, sigY);
      if (agreement.witnessSignature && agreement.witnessSignature.startsWith("data:image")) {
        try {
          const base64Data = agreement.witnessSignature.split(",")[1];
          const imgBuffer = Buffer.from(base64Data, "base64");
          doc.image(imgBuffer, witnessX, sigY + 15, { width: sigWidth, height: 50 });
        } catch {
          doc.text("____________________", witnessX, sigY + 15);
        }
      } else {
        doc.text("____________________", witnessX, sigY + 15);
      }

      doc.moveDown(3);

      // Witness name and date
      doc
        .fontSize(9)
        .font("Helvetica")
        .text(`Witness Name: ${agreement.witnessName || "____________________"}`, margin, doc.y)
        .moveDown(0.8);

      doc
        .text(
          `Mobile: ${agreement.mobile || ""}    Date: ${agreement.createdAt ? new Date(agreement.createdAt).toLocaleDateString("en-IN") : ""}`,
          margin,
          doc.y
        )
        .moveDown(1.5);

      // Thumb prints
      doc
        .text("Hirer Thumb Print: ____________________    Witness Thumb Print: ____________________", margin, doc.y)
        .moveDown(1);

      // Notes/inspection
      if (agreement.notes) {
        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .text("Inspection Notes:", margin, doc.y)
          .moveDown(0.3);

        doc
          .fontSize(9)
          .font("Helvetica")
          .text(agreement.notes, margin, doc.y, { width: pageWidth - margin * 2 })
          .moveDown(1);
      }

      // Finalize PDF
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
