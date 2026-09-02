export interface User {
  id: string;
  username: string;
  fullName: string;
  role: "admin" | "staff";
  permissions: string[];
  createdAt?: string;
}

export interface Agreement {
  _id: string;
  agreementNo: string;
  hireName: string;
  fatherName: string;
  mobile: string;
  address: string;
  licenceNo: string;
  aadhaarFile: string;
  licenceFrontFile: string;
  licenceBackFile: string;
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
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  _id: string;
  modelName: string;
  registration: string;
  vehicleType: string;
  fuelType: string;
  ratePerDay: number;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  totalAgreements: number;
  availableVehicles: number;
  outVehicles: number;
  totalDeposits: number;
  recentAgreements: Agreement[];
  recentVehicles: Vehicle[];
}

export interface PaginatedResponse<T> {
  agreements: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}
