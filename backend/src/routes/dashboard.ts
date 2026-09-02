import { Router, Response } from "express";
import Agreement from "../models/Agreement";
import Vehicle from "../models/Vehicle";
import { authenticate, AuthRequest } from "../middleware/auth";
import { syncVehicleStatuses } from "../utils/syncVehicleStatuses";

const router = Router();

// GET /api/dashboard
router.get(
  "/",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      // Sync vehicle statuses based on active agreements
      await syncVehicleStatuses();

      const [totalAgreements, availableVehicles, outVehicles, totalDeposits] =
        await Promise.all([
          Agreement.countDocuments(),
          Vehicle.countDocuments({ status: "Available" }),
          Vehicle.countDocuments({ status: "Out" }),
          Agreement.aggregate([
            { $group: { _id: null, total: { $sum: "$securityDeposit" } } },
          ]),
        ]);

      const recentAgreements = await Agreement.find()
        .sort({ createdAt: -1 })
        .limit(10);

      const recentVehicles = await Vehicle.find()
        .sort({ createdAt: -1 })
        .limit(6);

      res.json({
        totalAgreements,
        availableVehicles,
        outVehicles,
        totalDeposits: totalDeposits[0]?.total || 0,
        recentAgreements,
        recentVehicles,
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
