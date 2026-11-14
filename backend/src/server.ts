import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/database";
import { purgeExpiredGuests } from "./services/guest.service";
import { prepareVectorStore } from "./rag/vectorstore";

const PORT = process.env.PORT || 5000;

const REQUIRED_ENV_VARS = [
  "MONGODB_URI",
  "GROQ_API_KEY",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
];

function assertEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
    process.exit(1);
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    console.warn(
      "GOOGLE_CLIENT_ID not set — Google sign-in will be disabled.",
    );
  }
}

const startServer = async () => {
  assertEnv();

  await connectDB();

  // Create the vector collection/indexes on boot where the store needs it.
  await prepareVectorStore();

  // Clear out expired guest sessions (and their chats) now and every 30 min.
  const purge = () =>
    purgeExpiredGuests().catch((err) => console.error("Guest purge failed:", err));
  purge();
  setInterval(purge, 30 * 60 * 1000).unref();

  app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
  });
};

startServer();
