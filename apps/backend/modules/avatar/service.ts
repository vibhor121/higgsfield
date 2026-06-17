import { prisma } from "../../src/db";
import type { AvatarModel, AvatarImageModel } from "../../src/generated/prisma/models";
import type { AvatarImageType } from "../../src/generated/prisma/enums";
import { generateImage } from "../../src/huggingface";

export async function createAvatar(
  userId: string,
  name: string
): Promise<AvatarModel> {
  return prisma.avatar.create({ data: { userId, name } });
}

export async function getUserAvatars(userId: string) {
  const avatars = await prisma.avatar.findMany({
    where: { userId },
    include: { images: true },
  });
  return { avatars, total: avatars.length };
}

export async function getAvatar(
  avatarId: string,
  userId: string
): Promise<{ avatar: AvatarModel & { images: AvatarImageModel[] } } | { error: string; status: number }> {
  const avatar = await prisma.avatar.findUnique({
    where: { id: avatarId },
    include: { images: true },
  });
  if (!avatar) return { error: "Avatar not found", status: 404 };
  if (avatar.userId !== userId) return { error: "Access denied", status: 403 };
  return { avatar };
}

export async function deleteAvatar(
  avatarId: string,
  userId: string
): Promise<{ ok: true } | { error: string; status: number }> {
  const avatar = await prisma.avatar.findUnique({ where: { id: avatarId } });
  if (!avatar) return { error: "Avatar not found", status: 404 };
  if (avatar.userId !== userId) return { error: "Access denied", status: 403 };
  await prisma.avatarImage.deleteMany({ where: { avatarId } });
  await prisma.avatar.delete({ where: { id: avatarId } });
  return { ok: true };
}

export async function addAvatarImage(
  avatarId: string,
  userId: string,
  type: AvatarImageType,
  url: string
): Promise<{ image: AvatarImageModel } | { error: string; status: number }> {
  const avatar = await prisma.avatar.findUnique({ where: { id: avatarId } });
  if (!avatar) return { error: "Avatar not found", status: 404 };
  if (avatar.userId !== userId) return { error: "Access denied", status: 403 };
  const image = await prisma.avatarImage.create({ data: { avatarId, type, url } });
  return { image };
}

export async function getAvatarImages(
  avatarId: string,
  userId: string
): Promise<{ images: AvatarImageModel[] } | { error: string; status: number }> {
  const avatar = await prisma.avatar.findUnique({ where: { id: avatarId } });
  if (!avatar) return { error: "Avatar not found", status: 404 };
  if (avatar.userId !== userId) return { error: "Access denied", status: 403 };
  const images = await prisma.avatarImage.findMany({ where: { avatarId } });
  return { images };
}

export async function generateAvatarImage(
  avatarId: string,
  userId: string,
  prompt: string
): Promise<{ image: AvatarImageModel } | { error: string; status: number }> {
  const avatar = await prisma.avatar.findUnique({ where: { id: avatarId } });
  if (!avatar) return { error: "Avatar not found", status: 404 };
  if (avatar.userId !== userId) return { error: "Access denied", status: 403 };
  const url = await generateImage(prompt);
  const image = await prisma.avatarImage.create({
    data: { avatarId, type: "GENERATED", url },
  });
  return { image };
}

export async function deleteAvatarImage(
  avatarId: string,
  imageId: string,
  userId: string
): Promise<{ ok: true } | { error: string; status: number }> {
  const avatar = await prisma.avatar.findUnique({ where: { id: avatarId } });
  if (!avatar) return { error: "Avatar not found", status: 404 };
  if (avatar.userId !== userId) return { error: "Access denied", status: 403 };
  const image = await prisma.avatarImage.findUnique({ where: { id: imageId } });
  if (!image || image.avatarId !== avatarId) return { error: "Image not found", status: 404 };
  await prisma.avatarImage.delete({ where: { id: imageId } });
  return { ok: true };
}
