import { prisma } from "../../src/db";
import type { UserModel } from "../../src/generated/prisma/models";

export async function registerUser(
  username: string,
  password: string
): Promise<UserModel | null> {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return null;
  const hashedPassword = await Bun.password.hash(password);
  return prisma.user.create({ data: { username, password: hashedPassword } });
}

export async function validateCredentials(
  username: string,
  password: string
): Promise<UserModel | null> {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;
  const valid = await Bun.password.verify(password, user.password);
  return valid ? user : null;
}

export function safeUser(user: UserModel) {
  return {
    id: user.id,
    username: user.username,
    credits: user.credits,
  };
}
