import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../src/middleware/auth";
import {
  startAvatarVideoGeneration,
  getAvatarVideo,
  getUserAvatarVideos,
} from "./service";

const router = Router();

const createVideoSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  duration: z.number().int().positive("Duration must be a positive integer"),
  width: z.number().int().positive("Width must be a positive integer"),
  height: z.number().int().positive("Height must be a positive integer"),
  startFrame: z.url("Valid start frame URL required").optional(),
  endFrame: z.url("Valid end frame URL required").optional(),
  avatarIds: z.array(z.string()).default([]),
});

// POST /api/v1/avatar-videos
router.post("/avatar-videos", authMiddleware, async (req, res) => {
  const result = createVideoSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({ error: result.error.issues[0]?.message });
    return;
  }
  const { prompt, duration, width, height, startFrame, endFrame, avatarIds } = result.data;
  const outcome = await startAvatarVideoGeneration(
    req.userId!,
    prompt,
    duration,
    width,
    height,
    avatarIds,
    startFrame,
    endFrame
  );
  if ("error" in outcome) {
    res.status(outcome.status).json({ error: outcome.error });
    return;
  }
  res.status(201).json({ message: "Avatar video generation started", video: outcome.video });
});

// GET /api/v1/avatar-videos/:videoId
router.get("/avatar-videos/:videoId", authMiddleware, async (req, res) => {
  const result = await getAvatarVideo(req.params["videoId"] as string, req.userId!);
  if ("error" in result) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.json(result);
});

// GET /api/v1/avatar-videos
router.get("/avatar-videos", authMiddleware, async (req, res) => {
  res.json(await getUserAvatarVideos(req.userId!));
});

export const videoRoutes = router;
