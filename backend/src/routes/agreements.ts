import { Router, Response } from "express";
import path from "path";
import Agreement from "../models/Agreement";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { uploadAgreementFiles } from "../middleware/upload";

const router = Router();
const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// GET /api/agreements - List with search and pagination
router.get(
  "/",
  authenticate,
  authorize("agreements_view"),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        q,
        page = "1",
        limit = "20",
        status,
        paymentStatus,
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const filter: any = {};

      if (q) {
        const regex = new RegExp(q as string, "i");
        filter.$or = [
          { hireName: regex },
          { mobile: regex },
          { carReg: regex },
          { agreementNo: regex },
          { fatherName: regex },
        ];
      }

      if (paymentStatus) {
        filter.paymentStatus = paymentStatus;
      }

      const [agreements, total] = await Promise.all([
        Agreement.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Agreement.countDocuments(filter),
      ]);

      res.json({
        agreements,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum,
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// GET /api/agreements/:id
router.get(
  "/:id",
  authenticate,
  authorize("agreements_view"),
  async (req: AuthRequest, res: Response) => {
    try {
      const agreement = await Agreement.findById(req.params.id);
      if (!agreement) {
        res.status(404).json({ error: "Agreement not found" });
        return;
      }
      res.json(agreement);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// GET /api/agreements/:id/files/:filename - Serve uploaded files
router.get(
  "/:id/files/:filename",
  authenticate,
  authorize("agreements_view"),
  async (req: AuthRequest, res: Response) => {
    try {
      const filename = req.params.filename as string;
      const filePath = path.join(UPLOADS_DIR, filename);

      // Security: prevent path traversal
      if (!filePath.startsWith(UPLOADS_DIR)) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      const fs = require("fs");
      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: "File not found" });
        return;
      }

      // Set appropriate content type
      const ext = path.extname(filename).toLowerCase();
      const contentTypes: Record<string, string> = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".pdf": "application/pdf",
      };

      const contentType = contentTypes[ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.sendFile(filePath);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// POST /api/agreements - Create with file uploads
router.post(
  "/",
  authenticate,
  authorize("agreements_create"),
  (req: AuthRequest, res: Response) => {
    uploadAgreementFiles(req, res, async (err) => {
      if (err) {
        if (err instanceof require("multer").MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            res.status(400).json({ error: "File size must be less than 10MB" });
            return;
          }
          res.status(400).json({ error: `Upload error: ${err.message}` });
          return;
        }
        res.status(400).json({ error: err.message });
        return;
      }

      try {
        const now = new Date();
        const agreementNo = `KC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;

        // Get file paths from multer
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const aadhaarFile = files?.aadhaar?.[0]?.filename || "";
        const licenceFrontFile = files?.licenceFront?.[0]?.filename || "";
        const licenceBackFile = files?.licenceBack?.[0]?.filename || "";

        const agreement = new Agreement({
          agreementNo,
          hireName: req.body.hireName,
          fatherName: req.body.fatherName || "",
          mobile: req.body.mobile,
          address: req.body.address || "",
          licenceNo: req.body.licenceNo || "",
          aadhaarFile,
          licenceFrontFile,
          licenceBackFile,
          carReg: req.body.carReg || "",
          carModel: req.body.carModel || "",
          startDate: req.body.startDate || "",
          reportingTime: req.body.reportingTime || "",
          returnDate: req.body.returnDate || "",
          returnTime: req.body.returnTime || "",
          endTime: req.body.endTime || "",
          rentalAmount: parseFloat(req.body.rentalAmount) || 0,
          securityDeposit: parseFloat(req.body.securityDeposit) || 0,
          paymentMode: req.body.paymentMode || "Cash",
          paymentStatus: req.body.paymentStatus || "Pending",
          startKm: req.body.startKm || "",
          endKm: req.body.endKm || "",
          fuelStart: req.body.fuelStart || "",
          fuelEnd: req.body.fuelEnd || "",
          notes: req.body.notes || "",
          customerSignature: req.body.customerSignature || "",
          witnessName: req.body.witnessName || "",
          witnessSignature: req.body.witnessSignature || "",
          createdBy: req.user!._id,
        });

        await agreement.save();
        res.status(201).json(agreement);
      } catch (error) {
        console.error("Agreement creation error:", error);
        res.status(500).json({ error: "Server error" });
      }
    });
  }
);

// PUT /api/agreements/:id
router.put(
  "/:id",
  authenticate,
  authorize("agreements_edit"),
  async (req: AuthRequest, res: Response) => {
    try {
      const agreement = await Agreement.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!agreement) {
        res.status(404).json({ error: "Agreement not found" });
        return;
      }
      res.json(agreement);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// DELETE /api/agreements/:id
router.delete(
  "/:id",
  authenticate,
  authorize("agreements_delete"),
  async (req: AuthRequest, res: Response) => {
    try {
      const agreement = await Agreement.findByIdAndDelete(req.params.id);
      if (!agreement) {
        res.status(404).json({ error: "Agreement not found" });
        return;
      }
      res.json({ message: "Agreement deleted" });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
