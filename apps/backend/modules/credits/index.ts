import { Router } from "express";
import { authMiddleware } from "../../src/middleware/auth";
import { getUserCredits } from "./service";

const router = Router();

// GET /api/v1/credits
router.get("/credits", authMiddleware, async (req, res) => {
  const credits = await getUserCredits(req.userId!);
  if (credits === null) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ credits });
});

export const creditsRoutes = router;
