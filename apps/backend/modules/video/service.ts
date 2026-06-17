import { prisma } from "../../src/db";
import type { Prisma } from "../../src/generated/prisma/client";
import type { AvatarVideoModel } from "../../src/generated/prisma/models";
import { generateVideo } from "../../src/huggingface";

type AvatarVideoWithReferences = Prisma.AvatarVideoGetPayload<{
  include: { references: { include: { avatar: true } } };
}>;

export async function startAvatarVideoGeneration(
  userId: string,
  prompt: string,
  duration: number,
  width: number,
  height: number,
  avatarIds: string[],
  startFrame?: string,
  endFrame?: string
): Promise<{ video: AvatarVideoModel } | { error: string; status: number }> {
  if (avatarIds.length > 0) {
    const owned = await prisma.avatar.findMany({
      where: { id: { in: avatarIds }, userId },
      select: { id: true },
    });
    if (owned.length !== avatarIds.length) {
      return { error: "One or more avatars not found", status: 404 };
    }
  }

  const video = await prisma.avatarVideo.create({
    data: { userId, prompt, duration, width, height, startFrame, endFrame },
  });

  if (avatarIds.length > 0) {
    await prisma.avatarVideoReference.createMany({
      data: avatarIds.map((avatarId) => ({ avatarVideoId: video.id, avatarId })),
    });
  }

  // Kick off HF video generation in the background
  void runVideoGeneration(video.id, prompt);

  return { video };
}

async function runVideoGeneration(videoId: string, prompt: string) {
  try {
    await prisma.avatarVideo.update({ where: { id: videoId }, data: { status: "PROCESSING" } });
    const resultUrl = await generateVideo(prompt);
    await prisma.avatarVideo.update({ where: { id: videoId }, data: { status: "COMPLETED", resultUrl } });
  } catch (err) {
    console.error("Video generation failed:", err);
    await prisma.avatarVideo.update({ where: { id: videoId }, data: { status: "FAILED" } });
  }
}

export async function getAvatarVideo(
  videoId: string,
  userId: string
): Promise<{ video: AvatarVideoWithReferences } | { error: string; status: number }> {
  const video = await prisma.avatarVideo.findUnique({
    where: { id: videoId },
    include: { references: { include: { avatar: true } } },
  });
  if (!video) return { error: "Video not found", status: 404 };
  if (video.userId !== userId) return { error: "Access denied", status: 403 };
  return { video };
}

export async function getUserAvatarVideos(
  userId: string
): Promise<{ videos: AvatarVideoWithReferences[]; total: number }> {
  const videos = await prisma.avatarVideo.findMany({
    where: { userId },
    include: { references: { include: { avatar: true } } },
  });
  return { videos, total: videos.length };
}
