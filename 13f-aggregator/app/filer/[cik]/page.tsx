import Link from "next/link";
import { getFilerInfo, getFilerFilings, getHoldings, formatQuarter, formatValue } from "@/lib/edgar";
import type { Holding } from "@/lib/edgar";

export const dynamic = "force-dynamic";

export default async function FilerPage({ params, searchParams }: {
  params: { cik: string };
  searchParams: { filing?: string };
}) {
  const { cik } = params;
  const [filerInfo, filings] = await Promise.all([getFilerInfo(cik), getFilerFilings(cik)]);

  if (!filerInfo) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-300 mb-4">Filer not found</h1>
        <Link href="/" className="text-blue-400 hover:underline">← Back to home</Link>
      </div>
    );
  }

  const selectedAccession = searchParams.filing ?? filings[0]?.accessionNumber;
  const holdings = selectedAccession ? await getHoldings(cik, selectedAccession) : [];
  const selectedFiling = filings.find((f) => f.accessionNumber === selectedAccession);

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const top10 = holdings.slice(0, 10);

  return (
    <div>
      <div className="mb-2">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-300">← Back to all filers</Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">{filerInfo.name}</h1>
        <p className="text-gray-500 text-sm">CIK: {cik}</p>
      </div>

      {filings.length === 0 ? (
        <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-6 text-yellow-300">
          No 13F filings found for this entity.
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filings sidebar */}
          <aside className="lg:w-64 shrink-0">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Quarterly Filings
            </h2>
            <div className="space-y-2">
              {filings.map((filing) => (
                <Link
                  key={filing.accessionNumber}
                  href={`/filer/${cik}?filing=${filing.accessionNumber}`}
                  className={`block rounded-lg px-4 py-3 text-sm transition-colors ${
                    filing.accessionNumber === selectedAccession
                      ? "bg-blue-700 text-white"
                      : "bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800"
                  }`}
                >
                  <div className="font-medium">{formatQuarter(filing.reportDate)}</div>
                  <div className="text-xs opacity-70 mt-0.5">Filed {filing.filingDate}</div>
                </Link>
              ))}
            </div>
          </aside>

          {/* Holdings main content */}
          <div className="flex-1 min-w-0">
            {selectedFiling && (
              <div className="mb-6 flex flex-wrap gap-4">
                <StatCard label="Report Period" value={formatQuarter(selectedFiling.reportDate)} />
                <StatCard label="Total Portfolio Value" value={formatValue(totalValue)} />
                <StatCard label="Total Holdings" value={holdings.length.toString()} />
              </div>
            )}

            {holdings.length === 0 && selectedAccession && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
                Holdings data could not be loaded for this filing.
              </div>
            )}

            {holdings.length > 0 && (
              <>
                <TopHoldingsChart holdings={top10} totalValue={totalValue} />
                <HoldingsTable holdings={holdings} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function TopHoldingsChart({ holdings, totalValue }: { holdings: Holding[]; totalValue: number }) {
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-yellow-500", "bg-red-500",
    "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-cyan-500",
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Top 10 Holdings</h2>
      <div className="space-y-3">
        {holdings.map((h, i) => {
          const pct = totalValue > 0 ? (h.value / totalValue) * 100 : 0;
          return (
            <div key={h.cusip || i}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-200 font-medium truncate mr-2">{h.nameOfIssuer}</span>
                <span className="text-gray-400 shrink-0">
                  {formatValue(h.value)} ({pct.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors[i % colors.length]} rounded-full`}
                  style={{ width: `${Math.max(pct, 0.5)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">All Holdings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-left">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Issuer</th>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">CUSIP</th>
              <th className="px-4 py-3 font-medium text-right">Value ($000s)</th>
              <th className="px-4 py-3 font-medium text-right">Shares</th>
              <th className="px-4 py-3 font-medium">Type</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h, i) => (
              <tr
                key={h.cusip || i}
                className="border-b border-gray-800 hover:bg-gray-800 transition-colors"
              >
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 text-white font-medium">{h.nameOfIssuer}</td>
                <td className="px-4 py-3 text-gray-400">{h.titleOfClass}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{h.cusip}</td>
                <td className="px-4 py-3 text-right text-green-400">
                  {h.value.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {h.sshPrnamt.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{h.sshPrnamtType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
