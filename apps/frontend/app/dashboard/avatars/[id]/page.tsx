"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getAvatar, generateImage, createVideo, getVideo, type Avatar, type AvatarImage, type AvatarVideo } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function AvatarPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [images, setImages] = useState<AvatarImage[]>([]);
  const [videos, setVideos] = useState<AvatarVideo[]>([]);
  const [imagePrompt, setImagePrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAvatar = useCallback(async () => {
    try {
      const data = await getAvatar(id);
      setAvatar(data.avatar);
      setImages(data.avatar.images ?? []);
    } catch {
      router.push("/signin");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/signin"); return; }
    loadAvatar();
  }, [loadAvatar]);

  async function handleGenerateImage(e: React.FormEvent) {
    e.preventDefault();
    if (!imagePrompt.trim()) return;
    setGeneratingImage(true);
    try {
      const data = await generateImage(id, imagePrompt);
      setImages((prev) => [data.image, ...prev]);
      setImagePrompt("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGeneratingImage(false);
    }
  }

  async function handleGenerateVideo(e: React.FormEvent) {
    e.preventDefault();
    if (!videoPrompt.trim()) return;
    setGeneratingVideo(true);
    try {
      const data = await createVideo({ prompt: videoPrompt, duration: 5, width: 512, height: 512 });
      const newVideo = data.video;
      setVideos((prev) => [newVideo, ...prev]);
      setVideoPrompt("");
      // Poll status every 10s
      const poll = setInterval(async () => {
        const updated = await getVideo(newVideo.id);
        setVideos((prev) => prev.map((v) => v.id === newVideo.id ? updated.video : v));
        if (updated.video.status === "COMPLETED" || updated.video.status === "FAILED") {
          clearInterval(poll);
          setGeneratingVideo(false);
        }
      }, 10000);
    } catch (err: any) {
      alert(err.message);
      setGeneratingVideo(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen text-zinc-400">Loading...</div>;

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors text-sm">
          ← Dashboard
        </Link>
        <h1 className="text-xl font-bold">{avatar?.name}</h1>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">

        {/* Generate Image */}
        <section>
          <h2 className="text-xl font-bold mb-4">Generate Image</h2>
          <form onSubmit={handleGenerateImage} className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Describe the image... (e.g. a warrior in the mountains)"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={generatingImage}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-semibold transition-colors whitespace-nowrap"
            >
              {generatingImage ? "Generating..." : "Generate"}
            </button>
          </form>

          {images.length === 0 ? (
            <p className="text-zinc-500 text-sm">No images yet — generate one above!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden aspect-square bg-zinc-900">
                  <img
                    src={`${API_URL}${img.url}`}
                    alt={img.type}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-xs text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Generate Video */}
        <section>
          <h2 className="text-xl font-bold mb-4">Generate Video</h2>
          <form onSubmit={handleGenerateVideo} className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Describe the video... (e.g. walking through a forest)"
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={generatingVideo}
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 rounded-lg font-semibold transition-colors whitespace-nowrap"
            >
              {generatingVideo ? "Generating..." : "Generate Video"}
            </button>
          </form>

          {videos.length === 0 ? (
            <p className="text-zinc-500 text-sm">No videos yet — generate one above!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map((video) => (
                <div key={video.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-sm text-zinc-300 mb-2 truncate">"{video.prompt}"</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      video.status === "COMPLETED" ? "bg-green-900 text-green-400" :
                      video.status === "FAILED" ? "bg-red-900 text-red-400" :
                      video.status === "PROCESSING" ? "bg-yellow-900 text-yellow-400" :
                      "bg-zinc-800 text-zinc-400"
                    }`}>
                      {video.status}
                    </span>
                    <span className="text-xs text-zinc-500">{video.duration}s · {video.width}x{video.height}</span>
                  </div>
                  {video.status === "COMPLETED" && video.resultUrl && (
                    <video
                      src={video.resultUrl.startsWith("/") ? `${API_URL}${video.resultUrl}` : video.resultUrl}
                      controls
                      className="w-full rounded-lg"
                    />
                  )}
                  {(video.status === "PENDING" || video.status === "PROCESSING") && (
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse w-2/3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
