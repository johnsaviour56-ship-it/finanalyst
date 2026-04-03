import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold text-brand mb-4">Financial Statement Analyzer</h1>
      <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
        Upload financial statements or enter data manually. Get instant profitability predictions,
        ratio analysis, and downloadable reports.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/upload"
          className="bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition"
        >
          Upload File
        </Link>
        <Link
          href="/manual"
          className="border border-brand text-brand px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
        >
          Manual Entry
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {[
          { title: "Smart Extraction", desc: "Automatically pulls key figures from PDF, Excel, and CSV files." },
          { title: "Ratio Analysis", desc: "Computes 7+ financial ratios including NPM, ROA, ROE, and more." },
          { title: "AI Prediction", desc: "Classifies companies as Profitable, Moderate, or High Risk with explanations." },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-semibold text-brand text-lg mb-2">{f.title}</h3>
            <p className="text-gray-600 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
