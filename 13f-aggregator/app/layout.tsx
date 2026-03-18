import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "13F Filing Aggregator",
  description: "Aggregate and analyze quarterly 13F SEC filings from institutional investors",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <nav className="border-b border-gray-800 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-blue-400 hover:text-blue-300">
              13F Aggregator
            </a>
            <div className="flex items-center gap-6 text-sm">
              <a href="/" className="text-gray-400 hover:text-white transition-colors">Filers</a>
              <a href="/aggregate" className="text-gray-400 hover:text-white transition-colors">Aggregate</a>
              <a href="/search" className="text-gray-400 hover:text-white transition-colors">Search</a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-gray-800 mt-16 py-6 text-center text-sm text-gray-500">
          Data sourced from SEC EDGAR. Not financial advice.
        </footer>
      </body>
    </html>
  );
}
