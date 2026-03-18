import Link from "next/link";
import { searchFilers } from "@/lib/edgar";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q ?? "";
  const results = query ? await searchFilers(query) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Search 13F Filers</h1>

      <form action="/search" method="GET" className="mb-8">
        <div className="flex gap-3">
          <input
            name="q"
            type="text"
            defaultValue={query}
            placeholder="Search by institutional investor name..."
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

      {query && (
        <div>
          <p className="text-gray-400 mb-4">
            {results.length > 0 ? `Found ${results.length} results for "${query}"` : `No results found for "${query}"`}
          </p>
          <div className="space-y-3">
            {results.map((filer) => (
              <Link
                key={filer.cik}
                href={`/filer/${filer.cik}`}
                className="block bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-blue-600 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{filer.name}</span>
                  <span className="text-sm text-gray-500">CIK {filer.cik}</span>
                </div>
                <div className="text-xs text-blue-500 mt-1">View 13F filings →</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
