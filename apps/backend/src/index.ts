import express from "express";
import cors from "cors";
import { join } from "node:path";
import { authRoutes } from "../modules/auth";
import { avatarRoutes } from "../modules/avatar";
import { videoRoutes } from "../modules/video";
import { creditsRoutes } from "../modules/credits";
import { modelsRoutes } from "../modules/models";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/generated", express.static(join(import.meta.dir, "..", "public", "generated")));

app.get("/", (_req, res) => {
  res.json({ message: "Higgsfield API is running" });
});
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1", authRoutes);
app.use("/api/v1", avatarRoutes);
app.use("/api/v1", videoRoutes);
app.use("/api/v1", creditsRoutes);
app.use("/api/v1", modelsRoutes);

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
