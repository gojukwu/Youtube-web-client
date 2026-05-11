"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  duration: number;
  views: number;
  channel: string;
}

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/videos/feed`
      );
      setVideos(response.data);
    } catch (error) {
      console.error("Failed to fetch videos", error);
    } finally {
      setLoading(false);
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            📺 YouTube
          </Link>
          <div className="flex-1 flex gap-2 mx-8">
            <input
              type="text"
              placeholder="Search videos..."
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-red-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  router.push(`/search?q=${e.currentTarget.value}`);
                }
              }}
            />
            <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded">
              🔍
            </button>
          </div>
          <div className="flex gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/playlists"
                  className="hover:text-red-500 transition"
                >
                  My Playlists
                </Link>
                <Link href="/profile" className="hover:text-red-500 transition">
                  👤 Profile
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    setIsLoggedIn(false);
                    router.push("/");
                  }}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="border border-red-600 px-4 py-2 rounded hover:bg-red-600"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4 hidden md:block">
          <nav className="space-y-4">
            <div>
              <h3 className="text-gray-400 text-sm font-semibold mb-2">
                MENU
              </h3>
              <Link
                href="/"
                className="block px-4 py-2 hover:bg-gray-700 rounded"
              >
                🏠 Home
              </Link>
              <Link
                href="/trending"
                className="block px-4 py-2 hover:bg-gray-700 rounded"
              >
                🔥 Trending
              </Link>
              <Link
                href="/subscriptions"
                className="block px-4 py-2 hover:bg-gray-700 rounded"
              >
                📺 Subscriptions
              </Link>
            </div>
            {isLoggedIn && (
              <div>
                <h3 className="text-gray-400 text-sm font-semibold mb-2">
                  LIBRARY
                </h3>
                <Link
                  href="/playlists"
                  className="block px-4 py-2 hover:bg-gray-700 rounded"
                >
                  📑 Playlists
                </Link>
                <Link
                  href="/history"
                  className="block px-4 py-2 hover:bg-gray-700 rounded"
                >
                  ⏱️ History
                </Link>
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <h1 className="text-3xl font-bold mb-6">Recommended for you</h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading videos...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-gray-400 text-center p-8">No videos found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video) => (
                <Link key={video.id} href={`/watch/${video.id}`}>
                  <div className="group cursor-pointer">
                    <div className="relative bg-gray-800 rounded-lg overflow-hidden mb-3 h-48">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          🎬
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs">
                        {Math.floor(video.duration / 60)}:
                        {String(video.duration % 60).padStart(2, "0")}
                      </div>
                    </div>
                    <h3 className="font-semibold line-clamp-2 group-hover:text-red-500 transition">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">{video.channel}</p>
                    <p className="text-sm text-gray-400">
                      {formatViews(video.views)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
