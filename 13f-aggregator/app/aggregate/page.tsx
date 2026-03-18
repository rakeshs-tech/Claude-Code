import { getTopFilers, getFilerFilings, getHoldings, formatValue } from "@/lib/edgar";

export const dynamic = "force-dynamic";

interface AggregateHolding {
  nameOfIssuer: string;
  cusip: string;
  totalValue: number;
  filerCount: number;
  filers: string[];
  totalShares: number;
}

export default async function AggregatePage() {
  const filers = await getTopFilers();

  // Fetch latest filing for each filer
  const holdingsData = await Promise.all(
    filers.map(async (filer) => {
      const filings = await getFilerFilings(filer.cik);
      if (!filings[0]) return { filer, holdings: [] };
      const holdings = await getHoldings(filer.cik, filings[0].accessionNumber);
      return { filer, holdings };
    })
  );

  // Aggregate by CUSIP
  const aggregateMap = new Map<string, AggregateHolding>();

  for (const { filer, holdings } of holdingsData) {
    for (const holding of holdings) {
      const key = holding.cusip || holding.nameOfIssuer;
      const existing = aggregateMap.get(key);
      if (existing) {
        existing.totalValue += holding.value;
        existing.totalShares += holding.sshPrnamt;
        existing.filerCount += 1;
        existing.filers.push(filer.name);
      } else {
        aggregateMap.set(key, {
          nameOfIssuer: holding.nameOfIssuer,
          cusip: holding.cusip,
          totalValue: holding.value,
          filerCount: 1,
          filers: [filer.name],
          totalShares: holding.sshPrnamt,
        });
      }
    }
  }

  const sorted = Array.from(aggregateMap.values())
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 50);

  const activeFilers = holdingsData.filter((d) => d.holdings.length > 0).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Aggregate Holdings</h1>
        <p className="text-gray-400">
          Combined holdings across {activeFilers} institutional investors, ranked by total value.
        </p>
      </div>

      <div className="flex gap-4 mb-8 flex-wrap">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Filers Analyzed</div>
          <div className="text-2xl font-bold text-white">{activeFilers}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Unique Holdings</div>
          <div className="text-2xl font-bold text-white">{aggregateMap.size.toLocaleString()}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Value</div>
          <div className="text-2xl font-bold text-white">
            {formatValue(sorted.reduce((s, h) => s + h.totalValue, 0))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Most Widely Held Securities</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-left">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Security</th>
                <th className="px-4 py-3 font-medium">CUSIP</th>
                <th className="px-4 py-3 font-medium text-right">Total Value</th>
                <th className="px-4 py-3 font-medium text-center">Filers</th>
                <th className="px-4 py-3 font-medium">Held By</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((h, i) => (
                <tr key={h.cusip || i} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 text-white font-medium">{h.nameOfIssuer}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{h.cusip}</td>
                  <td className="px-4 py-3 text-right text-green-400">{formatValue(h.totalValue)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded-full">
                      {h.filerCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {h.filers.slice(0, 3).join(", ")}
                    {h.filers.length > 3 && ` +${h.filers.length - 3} more`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
