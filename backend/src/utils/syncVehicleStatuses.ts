import Vehicle from "../models/Vehicle";
import Agreement from "../models/Agreement";

// Sync vehicle statuses based on active agreement dates
export async function syncVehicleStatuses(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Find all agreements that are currently active (start <= today <= return date)
  const activeAgreements = await Agreement.find({
    startDate: { $ne: "" },
    returnDate: { $ne: "" },
  }).select("carReg startDate returnDate");

  // Collect registration numbers of vehicles that should be "Out"
  const outRegNumbers = new Set<string>();

  for (const agreement of activeAgreements) {
    const start = agreement.startDate;
    const end = agreement.returnDate;

    if (start && end && start <= today && end >= today) {
      // Vehicle is currently rented out
      outRegNumbers.add(agreement.carReg);
    }
  }

  // Update vehicles: mark as "Out" if in active agreements
  // but don't override "Maintenance" status (manual override)
  if (outRegNumbers.size > 0) {
    await Vehicle.updateMany(
      {
        registration: { $in: Array.from(outRegNumbers) },
        status: { $ne: "Maintenance" },
      },
      { status: "Out" }
    );
  }

  // Mark vehicles that are no longer in active agreements as "Available"
  // but only if they were previously "Out" (don't override "Maintenance")
  await Vehicle.updateMany(
    {
      registration: { $nin: Array.from(outRegNumbers) },
      status: "Out",
    },
    { status: "Available" }
  );
}
