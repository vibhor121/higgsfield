import { prisma } from "../../src/db";
import type { UserModel } from "../../src/generated/prisma/models";

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<UserModel | null> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return null;
  const hashedPassword = await Bun.password.hash(password);
  return prisma.user.create({ data: { name, email, password: hashedPassword } });
}

export async function validateCredentials(
  email: string,
  password: string
): Promise<UserModel | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const valid = await Bun.password.verify(password, user.password);
  return valid ? user : null;
}

export function safeUser(user: UserModel) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    credits: user.credits,
    avatar: user.avatar ?? null,
  };
}
