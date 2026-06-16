import { prisma } from "../../src/db";
import type { UserModel } from "../../src/generated/prisma/models";

export async function updateAvatar(
  userId: string,
  avatarUrl: string
): Promise<UserModel | null> {
  const exists = await prisma.user.findUnique({ where: { id: userId } });
  if (!exists) return null;
  return prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
  });
}
