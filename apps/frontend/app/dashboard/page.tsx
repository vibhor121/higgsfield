"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAvatars, createAvatar, type Avatar } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [user, setUser] = useState<{ username: string; credits: number } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/signin"); return; }
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    loadAvatars();
  }, []);

  async function loadAvatars() {
    try {
      const data = await getAvatars();
      setAvatars(data.avatars);
    } catch {
      router.push("/signin");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const data = await createAvatar(name);
      setAvatars((prev) => [data.avatar, ...prev]);
      setName("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  }

  function handleLogout() {
    localStorage.clear();
    router.push("/");
  }

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Higgsfield AI
        </h1>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-zinc-400 text-sm">
              👤 {user.username} · {user.credits} credits
            </span>
          )}
          <button onClick={handleLogout} className="text-sm text-zinc-400 hover:text-white transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">My Avatars</h2>
        </div>

        {/* Create Avatar */}
        <form onSubmit={handleCreate} className="flex gap-3 mb-10">
          <input
            type="text"
            placeholder="Avatar name (e.g. My Hero)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-semibold transition-colors whitespace-nowrap"
          >
            {creating ? "Creating..." : "+ New Avatar"}
          </button>
        </form>

        {/* Avatar Grid */}
        {loading ? (
          <div className="text-center text-zinc-400 py-20">Loading...</div>
        ) : avatars.length === 0 ? (
          <div className="text-center text-zinc-400 py-20">
            <p className="text-lg mb-2">No avatars yet</p>
            <p className="text-sm">Create your first avatar above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {avatars.map((avatar) => (
              <Link
                key={avatar.id}
                href={`/dashboard/avatars/${avatar.id}`}
                className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-purple-500 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold mb-3">
                  {avatar.name[0]?.toUpperCase()}
                </div>
                <h3 className="font-semibold text-white">{avatar.name}</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  {new Date(avatar.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
