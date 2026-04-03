import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinAnalyst – Financial Statement Analyzer",
  description: "AI-powered financial profitability analysis platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-brand text-white px-6 py-4 flex items-center gap-4 shadow">
          <span className="text-xl font-bold tracking-tight">FinAnalyst</span>
          <a href="/" className="text-sm hover:underline">Home</a>
          <a href="/upload" className="text-sm hover:underline">Upload</a>
          <a href="/manual" className="text-sm hover:underline">Manual Entry</a>
          <a href="/history" className="text-sm hover:underline">History</a>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
