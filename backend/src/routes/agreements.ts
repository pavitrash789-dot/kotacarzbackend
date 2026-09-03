import { Router, Response } from "express";
import Agreement from "../models/Agreement";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { uploadAgreementFiles, uploadToCloudinary } from "../middleware/upload";
import { syncVehicleStatuses } from "../utils/syncVehicleStatuses";

const router = Router();

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

// POST /api/agreements - Create with file uploads (Cloudinary)
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

        // Upload files to Cloudinary
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        let aadhaarFile = "";
        let licenceFrontFile = "";
        let licenceBackFile = "";
        let carPhoto = "";

        if (files?.aadhaar?.[0]) {
          const result = await uploadToCloudinary(
            files.aadhaar[0].buffer,
            `${agreementNo}_aadhaar_${files.aadhaar[0].originalname.replace(/[^a-zA-Z0-9.]/g, "_")}`
          );
          aadhaarFile = result.url;
        }
        if (files?.licenceFront?.[0]) {
          const result = await uploadToCloudinary(
            files.licenceFront[0].buffer,
            `${agreementNo}_licenceFront_${files.licenceFront[0].originalname.replace(/[^a-zA-Z0-9.]/g, "_")}`
          );
          licenceFrontFile = result.url;
        }
        if (files?.licenceBack?.[0]) {
          const result = await uploadToCloudinary(
            files.licenceBack[0].buffer,
            `${agreementNo}_licenceBack_${files.licenceBack[0].originalname.replace(/[^a-zA-Z0-9.]/g, "_")}`
          );
          licenceBackFile = result.url;
        }
        if (files?.carPhoto?.[0]) {
          const result = await uploadToCloudinary(
            files.carPhoto[0].buffer,
            `${agreementNo}_carPhoto_${files.carPhoto[0].originalname.replace(/[^a-zA-Z0-9.]/g, "_")}`
          );
          carPhoto = result.url;
        }

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
          carPhoto,
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
        await syncVehicleStatuses();
        res.status(201).json(agreement);
      } catch (error) {
        console.error("Agreement creation error:", error);
        res.status(500).json({ error: "Server error" });
      }
    });
  }
);

// PUT /api/agreements/:id - Update with optional file uploads (Cloudinary)
router.put(
  "/:id",
  authenticate,
  authorize("agreements_edit"),
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
        const updateData: any = { ...req.body };

        // Parse numeric fields
        if (updateData.rentalAmount !== undefined) {
          updateData.rentalAmount = parseFloat(updateData.rentalAmount) || 0;
        }
        if (updateData.securityDeposit !== undefined) {
          updateData.securityDeposit = parseFloat(updateData.securityDeposit) || 0;
        }

        // Remove fields that shouldn't be updated directly
        delete updateData._id;
        delete updateData.agreementNo;
        delete updateData.createdBy;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        // Upload new files to Cloudinary if provided
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        if (files?.aadhaar?.[0]) {
          const result = await uploadToCloudinary(
            files.aadhaar[0].buffer,
            `${req.params.id}_aadhaar_${files.aadhaar[0].originalname.replace(/[^a-zA-Z0-9.]/g, "_")}`
          );
          updateData.aadhaarFile = result.url;
        }
        if (files?.licenceFront?.[0]) {
          const result = await uploadToCloudinary(
            files.licenceFront[0].buffer,
            `${req.params.id}_licenceFront_${files.licenceFront[0].originalname.replace(/[^a-zA-Z0-9.]/g, "_")}`
          );
          updateData.licenceFrontFile = result.url;
        }
        if (files?.licenceBack?.[0]) {
          const result = await uploadToCloudinary(
            files.licenceBack[0].buffer,
            `${req.params.id}_licenceBack_${files.licenceBack[0].originalname.replace(/[^a-zA-Z0-9.]/g, "_")}`
          );
          updateData.licenceBackFile = result.url;
        }
        if (files?.carPhoto?.[0]) {
          const result = await uploadToCloudinary(
            files.carPhoto[0].buffer,
            `${req.params.id}_carPhoto_${files.carPhoto[0].originalname.replace(/[^a-zA-Z0-9.]/g, "_")}`
          );
          updateData.carPhoto = result.url;
        }

        const agreement = await Agreement.findByIdAndUpdate(
          req.params.id,
          updateData,
          { new: true }
        );
        if (!agreement) {
          res.status(404).json({ error: "Agreement not found" });
          return;
        }
        await syncVehicleStatuses();
        res.json(agreement);
      } catch (error) {
        console.error("Agreement update error:", error);
        res.status(500).json({ error: "Server error" });
      }
    });
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
      await syncVehicleStatuses();
      res.json({ message: "Agreement deleted" });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
