import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  googleLogin,
  refresh,
  getMe,
  guestSession,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Slow down brute-force attempts against login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

// Looser than authLimiter: a guest re-validates their session on every page load.
const guestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/google", authLimiter, googleLogin);
router.post("/guest", guestLimiter, guestSession);
router.post("/refresh", refresh);
router.get("/me", protect, getMe);

export default router;
