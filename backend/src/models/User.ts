import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  username: string;
  password: string;
  fullName: string;
  role: "admin" | "staff";
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    role: { type: String, enum: ["admin", "staff"], default: "staff" },
    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Default permissions by role
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "dashboard",
    "agreements_view",
    "agreements_create",
    "agreements_edit",
    "agreements_delete",
    "agreements_pdf",
    "vehicles_view",
    "vehicles_create",
    "vehicles_edit",
    "vehicles_delete",
    "users_view",
    "users_create",
    "users_edit",
    "users_delete",
  ],
  staff: [
    "dashboard",
    "agreements_view",
    "agreements_create",
    "agreements_pdf",
    "vehicles_view",
  ],
};

userSchema.pre("save", async function (next) {
  // Set permissions based on role if not already set or if role changed
  if (!this.permissions.length || this.isModified("role")) {
    this.permissions = ROLE_PERMISSIONS[this.role] || [];
  }
  // Hash password if modified
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
