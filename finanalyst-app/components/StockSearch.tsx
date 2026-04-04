"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Result { ticker: string; name: string; exchange: string; shortCode: string; }

export default function StockSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setOpen(true);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const select = (r: Result) => {
    setQuery(""); setOpen(false);
    router.push(`/stock/${r.shortCode}`);
  };

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white overflow-hidden focus-within:border-brand transition">
        <span className="pl-3 text-gray-400">🔍</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search company or NGX ticker..."
          className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
        />
        {loading && <span className="pr-3 text-xs text-gray-400 animate-pulse">...</span>}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border rounded-xl shadow-lg z-50 overflow-hidden">
          {results.map((r) => (
            <button key={r.ticker} onClick={() => select(r)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b last:border-0">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm text-gray-800">{r.shortCode}</span>
                  <span className="text-xs text-gray-500 ml-2 truncate">{r.name}</span>
                </div>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{r.exchange || "NGX"}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
