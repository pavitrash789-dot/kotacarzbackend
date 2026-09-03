import mongoose, { Document, Schema } from "mongoose";

export interface IAgreement extends Document {
  agreementNo: string;
  hireName: string;
  fatherName: string;
  mobile: string;
  address: string;
  licenceNo: string;
  aadhaarFile: string;
  licenceFrontFile: string;
  licenceBackFile: string;
  carPhoto: string;
  carReg: string;
  carModel: string;
  startDate: string;
  reportingTime: string;
  returnDate: string;
  returnTime: string;
  endTime: string;
  rentalAmount: number;
  securityDeposit: number;
  paymentMode: string;
  paymentStatus: string;
  startKm: string;
  endKm: string;
  fuelStart: string;
  fuelEnd: string;
  notes: string;
  customerSignature: string;
  witnessName: string;
  witnessSignature: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const agreementSchema = new Schema<IAgreement>(
  {
    agreementNo: { type: String, required: true, unique: true },
    hireName: { type: String, required: true, trim: true },
    fatherName: { type: String, default: "" },
    mobile: { type: String, required: true },
    address: { type: String, default: "" },
    licenceNo: { type: String, default: "" },
    aadhaarFile: { type: String, default: "" },
    licenceFrontFile: { type: String, default: "" },
    carPhoto: { type: String, default: "" },
    licenceBackFile: { type: String, default: "" },
    carReg: { type: String, default: "" },
    carModel: { type: String, default: "" },
    startDate: { type: String, default: "" },
    reportingTime: { type: String, default: "" },
    returnDate: { type: String, default: "" },
    returnTime: { type: String, default: "" },
    endTime: { type: String, default: "" },
    rentalAmount: { type: Number, default: 0 },
    securityDeposit: { type: Number, default: 0 },
    paymentMode: { type: String, default: "Cash" },
    paymentStatus: { type: String, default: "Pending" },
    startKm: { type: String, default: "" },
    endKm: { type: String, default: "" },
    fuelStart: { type: String, default: "" },
    fuelEnd: { type: String, default: "" },
    notes: { type: String, default: "" },
    customerSignature: { type: String, default: "" },
    witnessName: { type: String, default: "" },
    witnessSignature: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Index for search
agreementSchema.index({ hireName: "text", mobile: "text", carReg: "text", agreementNo: "text" });

export default mongoose.model<IAgreement>("Agreement", agreementSchema);
