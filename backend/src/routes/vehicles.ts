import { Router, Response } from "express";
import Vehicle from "../models/Vehicle";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/vehicles
router.get(
  "/",
  authenticate,
  authorize("vehicles_view"),
  async (req: AuthRequest, res: Response) => {
    try {
      const vehicles = await Vehicle.find().sort({ createdAt: -1 });
      res.json(vehicles);
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

// DELETE /api/vehicles/:id
router.delete(
  "/:id",
  authenticate,
  authorize("vehicles_delete"),
  async (req: AuthRequest, res: Response) => {
    try {
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
