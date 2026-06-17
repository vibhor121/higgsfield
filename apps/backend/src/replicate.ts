const REPLICATE_API = "https://api.replicate.com/v1";

export async function generateVideoWithReplicate(prompt: string): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN is not set");

  // Step 1: Create prediction
  const createRes = await fetch(
    `${REPLICATE_API}/models/wavespeedai/wan-2.1-t2v-480p/predictions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          prompt,
          duration: 5,
          resolution: "480p",
        },
      }),
    }
  );

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Replicate error: ${err}`);
  }

  const prediction = await createRes.json() as { id: string; status: string; output?: string; error?: string };

  // Already done (rare but possible)
  if (prediction.status === "succeeded" && prediction.output) {
    return prediction.output;
  }

  // Step 2: Poll until completed (every 5s, max 10 minutes)
  for (let i = 0; i < 120; i++) {
    await Bun.sleep(5000);

    const pollRes = await fetch(`${REPLICATE_API}/predictions/${prediction.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await pollRes.json() as { status: string; output?: string; error?: string };

    if (result.status === "succeeded" && result.output) {
      return result.output;
    }

    if (result.status === "failed" || result.status === "canceled") {
      throw new Error(`Video generation ${result.status}: ${result.error ?? "unknown error"}`);
    }
  }

  throw new Error("Video generation timed out after 10 minutes");
}
