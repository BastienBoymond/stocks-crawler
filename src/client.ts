import type { StockQuote, StockInfo } from "./types.js";
import {
  BASE_URL,
  API_URL,
  mapPriceData,
  mapTick,
  calculateChange,
  resolveSymbol,
  round4,
  fetchCoursPage,
  parseName,
  parseStockInfo,
} from "./utils.js";

export async function searchSymbol(query: string): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/recherche/ajax?query=${encodeURIComponent(query)}`);
  const html = await res.text();
  const match = html.match(/href="(?:\/bourse\/[^"]*)?\/cours\/([^/"]+)\/?"/);
  return match ? match[1] : null;
}

export async function getStockInfo(code: string): Promise<StockInfo | null> {
  const symbol = await resolveSymbol(code);
  const html = await fetchCoursPage(symbol);
  return parseStockInfo(html, symbol);
}

export async function getQuote(code: string, includeInfo = false): Promise<StockQuote> {
  const symbol = await resolveSymbol(code);

  const res = await fetch(`${API_URL}/UpdateCharts?symbol=${symbol}&period=-1`);
  if (!res.ok) {
    throw new Error(`Failed to fetch quote for ${symbol}: HTTP ${res.status}`);
  }

  const json = await res.json();
  const days = json?.d;
  if (!Array.isArray(days) || days.length === 0) {
    throw new Error(`No quote data for symbol: ${symbol}`);
  }

  const bar = days[days.length - 1];
  if (!bar || typeof bar.c !== "number" || typeof bar.var !== "number") {
    throw new Error(`No quote data for symbol: ${symbol}`);
  }

  const todayData = mapPriceData(bar);
  const previousClose = round4(bar.c - bar.var);

  const html = await fetchCoursPage(symbol);

  const quote: StockQuote = {
    name: parseName(html) ?? symbol,
    symbol,
    previousClose,
    today: todayData,
    change: calculateChange(bar.c, previousClose),
    ticks: (bar.qt || []).map(mapTick),
  };

  if (includeInfo) {
    quote.info = parseStockInfo(html, symbol) || undefined;
  }

  return quote;
}

export async function getLastPrice(code: string): Promise<number> {
  const symbol = await resolveSymbol(code);

  const res = await fetch(`${API_URL}/UpdateCharts?symbol=${symbol}&period=0`);
  if (!res.ok) {
    throw new Error(`Failed to fetch price for ${symbol}: HTTP ${res.status}`);
  }

  // With period=0 the bar is the top-level object: {d: <date>, o, h, l, c, v}.
  // A dead/invalid symbol returns an empty array instead.
  const bar = await res.json();
  if (Array.isArray(bar) || typeof bar?.c !== "number") {
    throw new Error(`No quote data for symbol: ${symbol}`);
  }

  return bar.c;
}
