import dotenv from "dotenv";
dotenv.config();  // loads .env from backend/ (cwd)

import mongoose from "mongoose";
import User from "./models/User";

async function seed() {
  try {
    // Build URI from parts if individual vars are provided
    let uri = process.env.MONGODB_URI || "";
    if (!uri || uri.includes("<")) {
      const username = process.env.MONGODB_USERNAME || "";
      const password = process.env.MONGODB_PASSWORD || "";
      if (username && password) {
        uri = `mongodb+srv://${username}:${password}@cluster0.mongodb.net/kota_caz?retryWrites=true&w=majority`;
      }
    }

    if (!uri || !uri.startsWith("mongodb")) {
      console.error("Invalid MongoDB URI. Check your .env file.");
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists. Skipping seed.");
      process.exit(0);
    }

    // Create default admin
    const admin = new User({
      username: "admin",
      password: "admin123",
      fullName: "Administrator",
      role: "admin",
    });
    await admin.save();
    console.log("Admin user created: admin / admin123");

    // Create a default staff member
    const staff = new User({
      username: "staff",
      password: "staff123",
      fullName: "Staff Member",
      role: "staff",
    });
    await staff.save();
    console.log("Staff user created: staff / staff123");

    console.log("\nChange these passwords immediately in production!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
