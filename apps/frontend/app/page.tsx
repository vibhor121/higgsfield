import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="max-w-2xl">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Higgsfield AI
        </h1>
        <p className="text-xl text-zinc-400 mb-10">
          Generate stunning AI avatars and videos in seconds
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/signin"
            className="px-8 py-3 border border-zinc-700 hover:border-zinc-500 rounded-full font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>
        <div className="mt-20 grid grid-cols-3 gap-6 text-left">
          {[
            { title: "AI Avatars", desc: "Create personalized AI avatars from your photos" },
            { title: "Image Generation", desc: "Generate stunning images with just a text prompt" },
            { title: "Video Generation", desc: "Bring your avatars to life with AI video" },
          ].map((f) => (
            <div key={f.title} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900">
              <h3 className="font-semibold mb-2 text-white">{f.title}</h3>
              <p className="text-sm text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
