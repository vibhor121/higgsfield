import { prisma } from "../../src/db";

export async function getUserCredits(userId: string): Promise<number | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ? user.credits : null;
}
