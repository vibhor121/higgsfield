import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const GENERATED_DIR = join(import.meta.dir, "..", "public", "generated");

async function ensureDir() {
  await mkdir(GENERATED_DIR, { recursive: true });
}

export async function generateImage(prompt: string): Promise<string> {
  const encoded = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&seed=${Date.now()}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image generation failed: ${response.statusText}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  await ensureDir();
  const filename = `${crypto.randomUUID()}.jpg`;
  await writeFile(join(GENERATED_DIR, filename), buffer);
  return `/generated/${filename}`;
}

export async function generateVideo(prompt: string): Promise<string> {
  const token = process.env.HUGGINGFACE_API_TOKEN;
  if (!token) throw new Error("HUGGINGFACE_API_TOKEN is not set");

  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/damo-vilab/text-to-video-ms-1.7b",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Video generation failed: ${err}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await ensureDir();
  const filename = `${crypto.randomUUID()}.mp4`;
  await writeFile(join(GENERATED_DIR, filename), buffer);
  return `/generated/${filename}`;
}
