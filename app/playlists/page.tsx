"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Playlist {
  id: string;
  title: string;
  description: string;
  video_count: number;
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/playlists`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPlaylists(response.data);
    } catch (error) {
      console.error("Failed to fetch playlists", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/playlists`,
        { title: newPlaylistTitle },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setNewPlaylistTitle("");
      fetchPlaylists();
    } catch (error) {
      console.error("Failed to create playlist", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            📺 YouTube
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-red-500">
              Home
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                router.push("/login");
              }}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">My Playlists</h1>

        {/* Create Playlist Form */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Create New Playlist</h2>
          <form onSubmit={handleCreatePlaylist} className="flex gap-2">
            <input
              type="text"
              value={newPlaylistTitle}
              onChange={(e) => setNewPlaylistTitle(e.target.value)}
              placeholder="Playlist title..."
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-red-500"
              required
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-semibold"
            >
              Create
            </button>
          </form>
        </div>

        {/* Playlists Grid */}
        {loading ? (
          <div>Loading playlists...</div>
        ) : playlists.length === 0 ? (
          <div className="text-gray-400 text-center p-8">No playlists yet. Create one!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((playlist) => (
              <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition cursor-pointer">
                  <h3 className="font-semibold text-lg mb-2">{playlist.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{playlist.description}</p>
                  <p className="text-gray-500 text-xs">
                    {playlist.video_count} video{playlist.video_count !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
