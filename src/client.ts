import type { StockQuote, StockInfo } from "./types.js";
import { BASE_URL, API_URL, mapPriceData, mapTick, calculateChange, resolveSymbol } from "./utils.js";

export async function searchSymbol(query: string): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/recherche/ajax?query=${encodeURIComponent(query)}`);
  const html = await res.text();
  const match = html.match(/href="(?:\/bourse\/[^"]*)?\/cours\/([^/"]+)\/?"/);
  return match ? match[1] : null;
}

export async function getStockInfo(code: string): Promise<StockInfo | null> {
  const symbol = await resolveSymbol(code);

  const res = await fetch(`${BASE_URL}/cours/${symbol}/`);
  const html = await res.text();

  const jsonMatch = html.match(/\{[^}]*"fv_code_isin"[^}]*\}/);
  if (!jsonMatch) return null;

  try {
    const data = JSON.parse(jsonMatch[0]);
    return {
      symbol: data.fv_symb_societe || symbol,
      isin: data.fv_code_isin?.split('_')[0] || '',
      exchange: data.fv_bourse_label || '',
      eligibility: data.fv_eligibilite || [],
      provider: data.fv_trust_group || '',
      issuer: data.fv_promoter || '',
      sector: data.fv_secteur_activite || '',
      index: data.fv_indice_principal || '',
    };
  } catch {
    return null;
  }
}

export async function getQuote(code: string, includeInfo = false): Promise<StockQuote> {
  const symbol = await resolveSymbol(code);

  const res = await fetch(
    `${API_URL}/GetTicksEOD?symbol=${symbol}&length=1&period=0`
  );
  const json = await res.json();
  const data = json.d;
  const todayData = mapPriceData(data.qd);
  const yesterdayData = mapPriceData(data.qv);

  const quote: StockQuote = {
    name: data.Name,
    symbol: data.SymbolId,
    yesterday: yesterdayData,
    today: todayData,
    change: calculateChange(todayData.current, yesterdayData.current),
    ticks: data.QuoteTab.map(mapTick),
  };

  if (includeInfo) {
    quote.info = await getStockInfo(symbol) || undefined;
  }

  return quote;
}

export async function getLastPrice(code: string): Promise<number> {
  const data = await getQuote(code);
  return data.today.current;
}
