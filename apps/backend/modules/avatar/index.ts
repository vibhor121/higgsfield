import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../src/middleware/auth";
import { updateAvatar } from "./service";

const router = Router();

const avatarSchema = z.object({
  avatarUrl: z.url("Valid avatar URL required"),
});

// POST /api/v1/avatar
router.post("/avatar", authMiddleware, async (req, res) => {
  const result = avatarSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({ error: result.error.issues[0]?.message });
    return;
  }
  const user = await updateAvatar(req.userId!, result.data.avatarUrl);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ message: "Avatar updated successfully", avatar: user.avatar });
});

export const avatarRoutes = router;
