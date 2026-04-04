import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinAnalyst – Financial Intelligence Platform",
  description: "AI-powered financial analysis, NGX market data, and profitability predictions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-brand text-white px-6 py-3 flex items-center gap-6 shadow sticky top-0 z-40">
          <a href="/" className="text-lg font-bold tracking-tight whitespace-nowrap">FinAnalyst</a>
          <div className="flex items-center gap-4 text-sm">
            <a href="/market" className="hover:text-blue-200 transition whitespace-nowrap">📊 NGX Market</a>
            <a href="/compare" className="hover:text-blue-200 transition whitespace-nowrap">⚖️ Compare</a>
            <a href="/upload" className="hover:text-blue-200 transition whitespace-nowrap">📂 Upload</a>
            <a href="/manual" className="hover:text-blue-200 transition whitespace-nowrap">✏️ Manual</a>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
