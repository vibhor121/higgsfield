import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../src/middleware/auth";
import { startVideoGeneration, getVideo, getUserVideos } from "./service";

const router = Router();

const createVideoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  prompt: z.string().min(1, "Prompt is required"),
  modelId: z.string().min(1, "Model ID is required"),
});

// POST /api/v1/video
router.post("/video", authMiddleware, async (req, res) => {
  const result = createVideoSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({ error: result.error.issues[0]?.message });
    return;
  }
  const { title, prompt, modelId } = result.data;
  const video = await startVideoGeneration(req.userId!, title, prompt, modelId);
  res.status(201).json({ message: "Video generation started", video });
});

// GET /api/v1/video/:videoid
router.get("/video/:videoid", authMiddleware, async (req, res) => {
  const result = await getVideo(req.params["videoid"] as string, req.userId!);
  if ("error" in result) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.json(result);
});

// GET /api/v1/videos
router.get("/videos", authMiddleware, async (req, res) => {
  res.json(await getUserVideos(req.userId!));
});

export const videoRoutes = router;
