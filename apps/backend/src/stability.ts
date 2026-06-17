import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const STABILITY_API = "https://api.stability.ai/v2beta";
const GENERATED_DIR = join(import.meta.dir, "..", "public", "generated");

async function ensureDir() {
  await mkdir(GENERATED_DIR, { recursive: true });
}

export async function generateVideoWithStability(prompt: string): Promise<string> {
  const token = process.env.STABILITY_API_KEY;
  if (!token) throw new Error("STABILITY_API_KEY is not set");

  // Step 1: Generate a source image from the prompt using Pollinations
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=576&nologo=true`;
  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) throw new Error("Failed to generate source image");
  const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

  // Step 2: Send image to Stability AI to animate into a video
  const formData = new FormData();
  formData.append("image", new Blob([imageBuffer], { type: "image/jpeg" }), "image.jpg");
  formData.append("seed", "0");
  formData.append("cfg_scale", "1.8");
  formData.append("motion_bucket_id", "127");

  const createRes = await fetch(`${STABILITY_API}/image-to-video`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Stability AI error: ${err}`);
  }

  const { id } = await createRes.json() as { id: string };

  // Step 3: Poll every 10s until video is ready (max 5 minutes)
  for (let i = 0; i < 30; i++) {
    await Bun.sleep(10000);

    const pollRes = await fetch(`${STABILITY_API}/image-to-video/result/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "video/*",
      },
    });

    if (pollRes.status === 202) continue; // still processing

    if (!pollRes.ok) {
      const err = await pollRes.text();
      throw new Error(`Stability AI poll error: ${err}`);
    }

    // 200 — video is ready, save it
    const videoBuffer = Buffer.from(await pollRes.arrayBuffer());
    await ensureDir();
    const filename = `${crypto.randomUUID()}.mp4`;
    await writeFile(join(GENERATED_DIR, filename), videoBuffer);
    return `/generated/${filename}`;
  }

  throw new Error("Video generation timed out after 5 minutes");
}
