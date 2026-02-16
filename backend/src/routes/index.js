import express from "express";
import profileRoutes from "./profileRoutes.js";
import resumeRoutes from "./resumeRoutes.js";
import jobRoutes from "./jobRoutes.js";
import applicationRoutes from "./applicationRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import authRoutes from "./auth.routes.js";
import entityRoutes from "./entityRoutes.js";

const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Rotas da API
router.use("/auth", authRoutes);
router.use("/entities", entityRoutes);
router.use("/profiles", profileRoutes);
router.use("/resumes", resumeRoutes);
router.use("/jobs", jobRoutes);
router.use("/applications", applicationRoutes);
router.use("/notifications", notificationRoutes);

export default router;
