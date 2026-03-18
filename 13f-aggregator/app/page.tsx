import Link from "next/link";
import { getTopFilers, getFilerFilings, formatQuarter } from "@/lib/edgar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const filers = await getTopFilers();

  const filersWithLatest = await Promise.all(
    filers.map(async (f) => {
      const filings = await getFilerFilings(f.cik);
      return { ...f, latestFiling: filings[0] ?? null };
    })
  );

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">13F Filing Aggregator</h1>
        <p className="text-gray-400 text-lg">
          Track quarterly institutional holdings from SEC EDGAR 13F filings. Discover what the
          world&apos;s largest asset managers are buying and selling.
        </p>
      </div>

      <div className="mb-8 bg-blue-950 border border-blue-800 rounded-xl p-5">
        <h2 className="font-semibold text-blue-300 mb-2">What are 13F Filings?</h2>
        <p className="text-sm text-blue-200">
          Institutional investment managers with over $100 million in assets must file Form 13F with
          the SEC quarterly, disclosing their U.S. equity holdings. These filings are made public
          45 days after each quarter ends.
        </p>
      </div>

      <SearchBar />

      <h2 className="text-xl font-semibold text-gray-200 mb-4">Top Institutional Investors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filersWithLatest.map((filer) => (
          <Link
            key={filer.cik}
            href={`/filer/${filer.cik}`}
            className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-blue-600 hover:bg-gray-850 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors leading-tight">
                {filer.name}
              </h3>
              <span className="text-xs text-gray-500 ml-2 shrink-0">CIK {filer.cik}</span>
            </div>
            {filer.latestFiling ? (
              <div className="text-sm text-gray-400 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-green-900 text-green-300 text-xs px-2 py-0.5 rounded">
                    {formatQuarter(filer.latestFiling.reportDate)}
                  </span>
                  <span>Latest filing</span>
                </div>
                <div>Filed: {filer.latestFiling.filingDate}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No recent 13F filings found</div>
            )}
            <div className="mt-3 text-xs text-blue-500 group-hover:text-blue-400">
              View holdings →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SearchBar() {
  return (
    <form action="/search" method="GET" className="mb-8">
      <div className="flex gap-3">
        <input
          name="q"
          type="text"
          placeholder="Search institutional investor by name..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
