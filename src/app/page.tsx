
"use client";

import { useState, useEffect } from "react";
import { Copy, Trash2, Eye } from "lucide-react";

interface Link {
  code: string;
  target: string;
  clicks: number;
}

export default function Dashboard() {
  const [origin, setOrigin] = useState("");
  const [target, setTarget] = useState("");
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    fetchLinks();
  }, []);

  async function fetchLinks() {
    setLoading(true);
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
    setLoading(false);
  }

  async function createLink() {
    if (!target.trim()) return;
    setCreating(true);

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target }),
    });

    setCreating(false);
    if (res.ok) {
      setTarget("");
      fetchLinks();
    }
  }

  function copyLink(code: string) {
    if (!origin) return;
    navigator.clipboard.writeText(`${origin}/${code}`);
  }

  async function deleteLink(code: string) {
    await fetch(`/api/links/${code}`, { method: "DELETE" });
    fetchLinks();
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-2">Tiny Link</h1>
        <p className="text-gray-400 mb-8">Shorten your URLs and share them easily</p>

        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Enter URL to shorten"
          className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white mb-4 focus:outline-none focus:border-gray-400"
        />

        <button
          onClick={createLink}
          disabled={creating}
          className="w-full py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition font-medium disabled:opacity-50"
        >
          {creating ? "Shortening..." : "Shorten URL"}
        </button>

        <h2 className="text-left text-xl font-semibold mt-10 mb-4">Recent URLs</h2>

        {loading ? (
          <p className="text-gray-500 text-left">Loading...</p>
        ) : links.length === 0 ? (
          <p className="text-gray-600 text-left">No URLs shortened yet.</p>
        ) : (
          <div className="space-y-4">
            {links.map((item) => (
              <div
                key={item.code}
                className="flex justify-between items-center bg-black border border-gray-800 p-4 rounded-xl"
              >
                <div className="text-left">
                  {origin && (
                    <a
                      href={`/${item.code}`}
                      target="_blank"
                      className="text-blue-400 hover:underline break-all"
                    >
                      {`${origin}/${item.code}`}
                    </a>
                  )}
                  <div className="text-gray-500 text-sm break-all mt-1">{item.target}</div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                    <Eye className="h-4 w-4" /> {item.clicks} views
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => copyLink(item.code)}>
                    <Copy className="h-5 w-5 text-gray-300 hover:text-white" />
                  </button>
                  <button onClick={() => deleteLink(item.code)}>
                    <Trash2 className="h-5 w-5 text-red-400 hover:text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
