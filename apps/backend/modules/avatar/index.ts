import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../src/middleware/auth";
import { AvatarImageType } from "../../src/generated/prisma/enums";
import {
  createAvatar,
  getUserAvatars,
  getAvatar,
  deleteAvatar,
  addAvatarImage,
  getAvatarImages,
  deleteAvatarImage,
  generateAvatarImage,
} from "./service";

const router = Router();

const createAvatarSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

const addImageSchema = z.object({
  type: z.enum(AvatarImageType),
  url: z.url("Valid image URL required"),
});

// POST /api/v1/avatars
router.post("/avatars", authMiddleware, async (req, res) => {
  const result = createAvatarSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({ error: result.error.issues[0]?.message });
    return;
  }
  const avatar = await createAvatar(req.userId!, result.data.name);
  res.status(201).json({ avatar });
});

// GET /api/v1/avatars
router.get("/avatars", authMiddleware, async (req, res) => {
  res.json(await getUserAvatars(req.userId!));
});

// GET /api/v1/avatars/:avatarId
router.get("/avatars/:avatarId", authMiddleware, async (req, res) => {
  const result = await getAvatar(req.params["avatarId"] as string, req.userId!);
  if ("error" in result) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.json(result);
});

// DELETE /api/v1/avatars/:avatarId
router.delete("/avatars/:avatarId", authMiddleware, async (req, res) => {
  const result = await deleteAvatar(req.params["avatarId"] as string, req.userId!);
  if ("error" in result) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.json({ message: "Avatar deleted successfully" });
});

// POST /api/v1/avatars/:avatarId/images
router.post("/avatars/:avatarId/images", authMiddleware, async (req, res) => {
  const result = addImageSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({ error: result.error.issues[0]?.message });
    return;
  }
  const outcome = await addAvatarImage(
    req.params["avatarId"] as string,
    req.userId!,
    result.data.type,
    result.data.url
  );
  if ("error" in outcome) {
    res.status(outcome.status).json({ error: outcome.error });
    return;
  }
  res.status(201).json(outcome);
});

// POST /api/v1/avatars/:avatarId/generate-image
router.post("/avatars/:avatarId/generate-image", authMiddleware, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string") {
    res.status(422).json({ error: "prompt is required" });
    return;
  }
  try {
    const result = await generateAvatarImage(req.params["avatarId"] as string, req.userId!, prompt);
    if ("error" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.status(201).json(result);
  } catch (err: any) {
    res.status(502).json({ error: err.message ?? "Image generation failed" });
  }
});

// GET /api/v1/avatars/:avatarId/images
router.get("/avatars/:avatarId/images", authMiddleware, async (req, res) => {
  const result = await getAvatarImages(req.params["avatarId"] as string, req.userId!);
  if ("error" in result) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.json(result);
});

// DELETE /api/v1/avatars/:avatarId/images/:imageId
router.delete("/avatars/:avatarId/images/:imageId", authMiddleware, async (req, res) => {
  const result = await deleteAvatarImage(
    req.params["avatarId"] as string,
    req.params["imageId"] as string,
    req.userId!
  );
  if ("error" in result) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.json({ message: "Image deleted successfully" });
});

export const avatarRoutes = router;
