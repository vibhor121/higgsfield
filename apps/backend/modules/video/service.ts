import { prisma } from "../../src/db";
import type { VideoModel } from "../../src/generated/prisma/models";

export async function startVideoGeneration(
  userId: string,
  title: string,
  prompt: string,
  modelId: string
): Promise<VideoModel> {
  return prisma.video.create({ data: { userId, title, prompt, modelId } });
}

export async function getVideo(
  videoId: string,
  userId: string
): Promise<{ video: VideoModel } | { error: string; status: number }> {
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) return { error: "Video not found", status: 404 };
  if (video.userId !== userId) return { error: "Access denied", status: 403 };
  return { video };
}

export async function getUserVideos(userId: string) {
  const videos = await prisma.video.findMany({ where: { userId } });
  return { videos, total: videos.length };
}
