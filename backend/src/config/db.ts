import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
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

    // Append database name if not present
    if (uri) {
      // Remove query string temporarily
      const qIndex = uri.indexOf("?");
      const base = qIndex > -1 ? uri.substring(0, qIndex) : uri;
      const query = qIndex > -1 ? uri.substring(qIndex) : "";

      // Check if database name exists (path after host, before query)
      const afterScheme = base.replace(/^mongodb\+srv:\/\//, "");
      const parts = afterScheme.split("/");
      if (parts.length < 2 || parts[1] === "") {
        // No database specified, add kota_caz
        uri = base + "/kota_caz" + query;
      }
    }

    if (!uri || !uri.startsWith("mongodb")) {
      console.error(
        "Invalid MongoDB URI. Set MONGODB_URI in .env or provide MONGODB_USERNAME and MONGODB_PASSWORD."
      );
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
