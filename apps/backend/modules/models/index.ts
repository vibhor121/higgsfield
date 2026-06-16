import { Router } from "express";
import { authMiddleware } from "../../src/middleware/auth";
import { getModels } from "./service";

const router = Router();

// GET /api/v1/models
router.get("/models", authMiddleware, (_req, res) => {
  res.json({ models: getModels() });
});

export const modelsRoutes = router;
