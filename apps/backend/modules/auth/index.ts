import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { JWT_SECRET } from "../../src/middleware/auth";
import { registerUser, validateCredentials, safeUser } from "./service";

const router = Router();

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signinSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password is required"),
});

// POST /api/v1/signup
router.post("/signup", async (req, res) => {
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({ error: result.error.issues[0]?.message });
    return;
  }
  const { name, email, password } = result.data;
  const user = await registerUser(name, email, password);
  if (!user) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  res.json({ token, user: safeUser(user) });
});

// POST /api/v1/signin
router.post("/signin", async (req, res) => {
  const result = signinSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({ error: result.error.issues[0]?.message });
    return;
  }
  const { email, password } = result.data;
  const user = await validateCredentials(email, password);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  res.json({ token, user: safeUser(user) });
});

export const authRoutes = router;
