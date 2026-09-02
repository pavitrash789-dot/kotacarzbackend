import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
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
    const qIndex = uri.indexOf("?");
    const base = qIndex > -1 ? uri.substring(0, qIndex) : uri;
    const query = qIndex > -1 ? uri.substring(qIndex) : "";

    const afterScheme = base.replace(/^mongodb\+srv:\/\//, "");
    const parts = afterScheme.split("/");
    if (parts.length < 2 || parts[1] === "") {
      uri = base + "/kota_caz" + query;
    }
  }

  if (!uri || !uri.startsWith("mongodb")) {
    console.error(
      "Invalid MongoDB URI. Set MONGODB_URI in .env or provide MONGODB_USERNAME and MONGODB_PASSWORD."
    );
    process.exit(1);
  }

  // Mask password in logs
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
  console.log(`Connecting to MongoDB: ${maskedUri}`);

  // Retry connection up to 5 times with exponential backoff
  const MAX_RETRIES = 5;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      return;
    } catch (error: any) {
      console.error(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed:`, error.message || error);
      if (attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error("All MongoDB connection attempts failed. Exiting.");
  process.exit(1);
};

export default connectDB;
