const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data;
}

// Auth
export const signup = (username: string, password: string) =>
  request<{ token: string; user: { id: string; username: string; credits: number } }>("/api/v1/signup", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const signin = (username: string, password: string) =>
  request<{ token: string; user: { id: string; username: string; credits: number } }>("/api/v1/signin", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

// Avatars
export const getAvatars = () =>
  request<{ avatars: Avatar[]; total: number }>("/api/v1/avatars");

export const createAvatar = (name: string) =>
  request<{ avatar: Avatar }>("/api/v1/avatars", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

export const getAvatar = (id: string) =>
  request<{ avatar: Avatar & { images: AvatarImage[] } }>(`/api/v1/avatars/${id}`);

export const generateImage = (avatarId: string, prompt: string) =>
  request<{ image: AvatarImage }>(`/api/v1/avatars/${avatarId}/generate-image`, {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });

export const getAvatarImages = (avatarId: string) =>
  request<{ images: AvatarImage[] }>(`/api/v1/avatars/${avatarId}/images`);

// Videos
export const createVideo = (data: { prompt: string; duration: number; width: number; height: number }) =>
  request<{ message: string; video: AvatarVideo }>("/api/v1/avatar-videos", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getVideos = () =>
  request<{ videos: AvatarVideo[]; total: number }>("/api/v1/avatar-videos");

export const getVideo = (id: string) =>
  request<{ video: AvatarVideo }>(`/api/v1/avatar-videos/${id}`);

// Types
export interface Avatar {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  images?: AvatarImage[];
}

export interface AvatarImage {
  id: string;
  avatarId: string;
  type: "FACE" | "FULL_BODY" | "STYLE_REFERENCE" | "GENERATED";
  url: string;
  createdAt: string;
}

export interface AvatarVideo {
  id: string;
  userId: string;
  prompt: string;
  duration: number;
  width: number;
  height: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  resultUrl: string | null;
  createdAt: string;
}
