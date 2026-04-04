import Link from "next/link";
import StockSearch from "@/components/StockSearch";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-brand mb-3">Financial Intelligence Platform</h1>
        <p className="text-gray-500 text-lg mb-8 max-w-2xl mx-auto">
          Analyze Nigerian Exchange stocks, upload financial statements, and get AI-powered profitability predictions — all in one place.
        </p>
        <div className="flex justify-center mb-8">
          <StockSearch />
        </div>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link href="/market" className="bg-brand text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-900 transition text-sm">
            📊 NGX Market
          </Link>
          <Link href="/upload" className="border-2 border-brand text-brand px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition text-sm">
            📂 Upload Statement
          </Link>
          <Link href="/compare" className="border-2 border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition text-sm">
            ⚖️ Compare Stocks
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
        {[
          { icon: "📡", title: "Live NGX Data", desc: "Real-time prices, market cap, P/E ratios, and volume for Nigerian Exchange listed companies.", href: "/market" },
          { icon: "🤖", title: "AI Stock Signals", desc: "Undervalued, Overvalued, Growth Opportunity — backed by fundamentals and technical analysis.", href: "/market" },
          { icon: "📈", title: "Technical Analysis", desc: "RSI, MACD, SMA 50/200, volatility, and trend detection for any stock.", href: "/market" },
          { icon: "⚖️", title: "Company Comparison", desc: "Compare up to 4 companies side-by-side on financials, technicals, and AI signals.", href: "/compare" },
          { icon: "📂", title: "Statement Upload", desc: "Upload PDF, Excel, or CSV financial statements for instant ratio analysis and scoring.", href: "/upload" },
          { icon: "🇳🇬", title: "NGX Focus", desc: "Deep coverage of DANGCEM, MTNN, GTCO, Zenith Bank, and 25+ other NGX-listed companies.", href: "/market" },
        ].map(f => (
          <Link key={f.title} href={f.href} className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md hover:border-brand transition group">
            <div className="text-3xl mb-2">{f.icon}</div>
            <h3 className="font-semibold text-brand text-base mb-1 group-hover:underline">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </Link>
        ))}
      </div>

      {/* NGX quick links */}
      <div className="mt-10 bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-sm font-semibold text-brand mb-4">Quick Access — NGX Blue Chips</h2>
        <div className="flex flex-wrap gap-2">
          {["DANGCEM","MTNN","GTCO","ZENITHBANK","ACCESS","UBA","AIRTELAFRI","NESTLE","SEPLAT","NB","FBNH","BUACEMENT"].map(t => (
            <Link key={t} href={`/stock/${t}`}
              className="text-xs bg-gray-100 hover:bg-brand hover:text-white text-gray-700 px-3 py-1.5 rounded-full transition font-medium">
              {t}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
