import { Router, Response } from "express";
import Vehicle from "../models/Vehicle";
import Agreement from "../models/Agreement";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

const router = Router();



// GET /api/vehicles - List with optional status filter
router.get(
  "/",
  authenticate,
  authorize("vehicles_view"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.query;
      const filter: any = {};
      if (status) {
        filter.status = status;
      }

      const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });

      // For Out vehicles, find their active agreement info
      const today = new Date().toISOString().slice(0, 10);
      const outVehicles = vehicles.filter((v) => v.status === "Out");

      const vehiclesWithInfo = await Promise.all(
        vehicles.map(async (v) => {
          const vehicleObj = v.toObject();
          if (v.status === "Out") {
            const activeAgreement = await Agreement.findOne({
              carReg: v.registration,
              startDate: { $lte: today },
              returnDate: { $gte: today },
            }).select("hireName mobile returnDate agreementNo");
            if (activeAgreement) {
              return {
                ...vehicleObj,
                activeAgreement: {
                  hireName: activeAgreement.hireName,
                  mobile: activeAgreement.mobile,
                  returnDate: activeAgreement.returnDate,
                  agreementNo: activeAgreement.agreementNo,
                  id: activeAgreement._id,
                },
              };
            }
          }
          return vehicleObj;
        })
      );

      res.json(vehiclesWithInfo);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// GET /api/vehicles/:id
router.get(
  "/:id",
  authenticate,
  authorize("vehicles_view"),
  async (req: AuthRequest, res: Response) => {
    try {
      const vehicle = await Vehicle.findById(req.params.id);
      if (!vehicle) {
        res.status(404).json({ error: "Vehicle not found" });
        return;
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// POST /api/vehicles
router.post(
  "/",
  authenticate,
  authorize("vehicles_create"),
  async (req: AuthRequest, res: Response) => {
    try {
      const existingVehicle = await Vehicle.findOne({
        registration: req.body.registration,
      });
      if (existingVehicle) {
        res.status(400).json({ error: "Registration number already exists" });
        return;
      }

      const vehicle = new Vehicle({
        modelName: req.body.modelName,
        registration: req.body.registration,
        vehicleType: req.body.vehicleType || "",
        fuelType: req.body.fuelType || "Petrol",
        ratePerDay: parseFloat(req.body.ratePerDay) || 0,
        status: req.body.status || "Available",
        notes: req.body.notes || "",
      });

      await vehicle.save();
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// PUT /api/vehicles/:id
router.put(
  "/:id",
  authenticate,
  authorize("vehicles_edit"),
  async (req: AuthRequest, res: Response) => {
    try {
      const vehicle = await Vehicle.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!vehicle) {
        res.status(404).json({ error: "Vehicle not found" });
        return;
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// PATCH /api/vehicles/:id/status - Manual status toggle (admin only)
router.patch(
  "/:id/status",
  authenticate,
  authorize("vehicles_edit"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.body;
      if (!["Available", "Out", "Maintenance"].includes(status)) {
        res.status(400).json({ error: "Invalid status" });
        return;
      }

      const vehicle = await Vehicle.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (!vehicle) {
        res.status(404).json({ error: "Vehicle not found" });
        return;
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// DELETE /api/vehicles/:id
router.delete(
  "/:id",
  authenticate,
  authorize("vehicles_delete"),
  async (req: AuthRequest, res: Response) => {
    try {
      const agreement = await Agreement.findOne({ carReg: (await Vehicle.findById(req.params.id))?.registration });
      if (agreement) {
        res.status(400).json({ error: "Cannot delete vehicle with existing agreements" });
        return;
      }

      const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
      if (!vehicle) {
        res.status(404).json({ error: "Vehicle not found" });
        return;
      }
      res.json({ message: "Vehicle deleted" });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
