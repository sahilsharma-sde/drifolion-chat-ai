import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import conversationRoutes from "./routes/conversation.routes";
import messageRoutes from "./routes/message.routes";
import documentRoutes from "./routes/document.routes";
import ragRoutes from "./routes/rag.route";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware";

const app = express();

// Support a comma-separated list of allowed origins, e.g.
// FRONTEND_URL="http://localhost:5173,https://nexus-ai.vercel.app"
const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.set("trust proxy", 1); // needed on Render/Railway for correct rate-limit IPs

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser requests (curl, server-to-server) with no origin
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));

// Basic global rate limit as a safety net against abuse/DoS
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/rag", ragRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
