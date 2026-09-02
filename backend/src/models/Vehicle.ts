import mongoose, { Document, Schema } from "mongoose";

export interface IVehicle extends Document {
  modelName: string;
  registration: string;
  vehicleType: string;
  fuelType: string;
  ratePerDay: number;
  status: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    modelName: { type: String, required: true, trim: true },
    registration: { type: String, required: true, unique: true, trim: true },
    vehicleType: { type: String, default: "" },
    fuelType: { type: String, default: "Petrol" },
    ratePerDay: { type: Number, default: 0 },
    status: { type: String, default: "Available" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IVehicle>("Vehicle", vehicleSchema);
