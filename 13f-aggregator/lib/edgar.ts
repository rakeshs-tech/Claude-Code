const EDGAR_BASE = "https://data.sec.gov";
const EDGAR_SUBMISSIONS = `${EDGAR_BASE}/submissions`;

export interface Filer {
  cik: string;
  name: string;
  tickers?: string[];
  exchanges?: string[];
}

export interface Filing {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  form: string;
}

export interface Holding {
  nameOfIssuer: string;
  titleOfClass: string;
  cusip: string;
  value: number; // in thousands
  sshPrnamt: number;
  sshPrnamtType: string;
  investmentDiscretion: string;
  votingAuthSole: number;
  votingAuthShared: number;
  votingAuthNone: number;
}

const HEADERS = {
  "User-Agent": "13F-Aggregator admin@example.com",
  "Accept-Encoding": "gzip, deflate",
};

export async function searchFilers(query: string): Promise<Filer[]> {
  const url = `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(query)}%22&forms=13F-HR&dateRange=custom&startdt=2024-01-01&enddt=2025-12-31`;
  const res = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  const seen = new Set<string>();
  const filers: Filer[] = [];
  for (const hit of data.hits?.hits ?? []) {
    const cik = hit._source?.entity_id?.replace(/^CIK/, "") ?? "";
    if (!cik || seen.has(cik)) continue;
    seen.add(cik);
    filers.push({ cik: cik.padStart(10, "0"), name: hit._source?.display_names?.[0] ?? hit._source?.file_date ?? "" });
  }
  return filers.slice(0, 20);
}

export async function getTopFilers(): Promise<Filer[]> {
  // Well-known institutional investors with their CIKs
  const known = [
    { cik: "0001067983", name: "Berkshire Hathaway" },
    { cik: "0000102909", name: "Vanguard Group" },
    { cik: "0001364742", name: "BlackRock" },
    { cik: "0000093751", name: "State Street Corp" },
    { cik: "0000019617", name: "JPMorgan Chase" },
    { cik: "0000831001", name: "Fidelity Management" },
    { cik: "0001336528", name: "Bridgewater Associates" },
    { cik: "0001649339", name: "Renaissance Technologies" },
    { cik: "0001709323", name: "Citadel Advisors" },
    { cik: "0001037389", name: "Tiger Global Management" },
    { cik: "0001603466", name: "Third Point LLC" },
    { cik: "0000200406", name: "T. Rowe Price" },
  ];
  return known;
}

export async function getFilerFilings(cik: string): Promise<Filing[]> {
  const paddedCik = cik.padStart(10, "0");
  const url = `${EDGAR_SUBMISSIONS}/CIK${paddedCik}.json`;
  const res = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();

  const filings: Filing[] = [];
  const recent = data.filings?.recent;
  if (!recent) return [];

  for (let i = 0; i < (recent.form?.length ?? 0); i++) {
    if (recent.form[i] === "13F-HR") {
      filings.push({
        accessionNumber: recent.accessionNumber[i],
        filingDate: recent.filingDate[i],
        reportDate: recent.reportDate[i],
        form: recent.form[i],
      });
    }
  }
  return filings.slice(0, 8);
}

export async function getFilerInfo(cik: string): Promise<{ name: string; cik: string } | null> {
  const paddedCik = cik.padStart(10, "0");
  const url = `${EDGAR_SUBMISSIONS}/CIK${paddedCik}.json`;
  const res = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = await res.json();
  return { name: data.name, cik: paddedCik };
}

export async function getHoldings(cik: string, accessionNumber: string): Promise<Holding[]> {
  const paddedCik = cik.padStart(10, "0");
  const accFormatted = accessionNumber.replace(/-/g, "");
  const acc = accessionNumber.replace(/-/g, "-");

  // Try to get the index to find the XML file
  const indexUrl = `https://www.sec.gov/Archives/edgar/data/${parseInt(paddedCik)}/${accFormatted}/${acc}-index.json`;
  const idxRes = await fetch(indexUrl, { headers: HEADERS, next: { revalidate: 86400 } });

  if (!idxRes.ok) return [];
  const idx = await idxRes.json();

  // Find the primary document (infotable XML)
  const files = idx.directory?.item ?? [];
  const xmlFile = files.find(
    (f: { name: string }) =>
      f.name.endsWith(".xml") &&
      (f.name.includes("infotable") || f.name.includes("primary_doc") || f.name.includes("form13f"))
  ) ?? files.find((f: { name: string }) => f.name.endsWith(".xml") && !f.name.endsWith("-index.xml"));

  if (!xmlFile) return [];

  const xmlUrl = `https://www.sec.gov/Archives/edgar/data/${parseInt(paddedCik)}/${accFormatted}/${xmlFile.name}`;
  const xmlRes = await fetch(xmlUrl, { headers: HEADERS, next: { revalidate: 86400 } });
  if (!xmlRes.ok) return [];

  const xml = await xmlRes.text();
  return parseInfoTable(xml);
}

function parseInfoTable(xml: string): Holding[] {
  const holdings: Holding[] = [];

  // Match infoTable entries
  const entryRegex = /<infoTable>([\s\S]*?)<\/infoTable>/gi;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const get = (tag: string) => {
      const m = new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`, "i").exec(entry);
      return m?.[1]?.trim() ?? "";
    };

    holdings.push({
      nameOfIssuer: get("nameOfIssuer"),
      titleOfClass: get("titleOfClass"),
      cusip: get("cusip"),
      value: parseInt(get("value") || "0"),
      sshPrnamt: parseInt(get("sshPrnamt") || "0"),
      sshPrnamtType: get("sshPrnamtType"),
      investmentDiscretion: get("investmentDiscretion"),
      votingAuthSole: parseInt(get("Sole") || "0"),
      votingAuthShared: parseInt(get("Shared") || "0"),
      votingAuthNone: parseInt(get("None") || "0"),
    });
  }

  return holdings.sort((a, b) => b.value - a.value);
}

export function formatQuarter(reportDate: string): string {
  const d = new Date(reportDate);
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `Q${q} ${d.getFullYear()}`;
}

export function formatValue(thousands: number): string {
  if (thousands >= 1_000_000) return `$${(thousands / 1_000_000).toFixed(2)}B`;
  if (thousands >= 1_000) return `$${(thousands / 1_000).toFixed(2)}M`;
  return `$${thousands.toFixed(0)}K`;
}
