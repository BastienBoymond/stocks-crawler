import type { PriceData, Tick, Change } from "./types.js";

export const BASE_URL = "https://www.boursorama.com";
export const API_URL = `${BASE_URL}/bourse/action/graph/ws`;

export function mapPriceData(raw: { o: number; h: number; l: number; c: number; v: number }): PriceData {
  return {
    open: raw.o,
    high: raw.h,
    low: raw.l,
    current: raw.c,
    volume: raw.v,
  };
}

export function mapTick(raw: { d: number; o: number; h: number; l: number; c: number; v: number }): Tick {
  return {
    timestamp: raw.d,
    open: raw.o,
    high: raw.h,
    low: raw.l,
    current: raw.c,
    volume: raw.v,
  };
}

export function calculateChange(today: number, yesterday: number): Change {
  const value = today - yesterday;
  const percent = (value / yesterday) * 100;
  return {
    value: Math.round(value * 10000) / 10000,
    percent: Math.round(percent * 100) / 100,
  };
}

export function isIsin(code: string): boolean {
  return /^[A-Z]{2}[A-Z0-9]{10}$/.test(code);
}

export async function resolveSymbol(code: string): Promise<string> {
  if (!isIsin(code)) return code;

  const res = await fetch(`${BASE_URL}/recherche/ajax?query=${encodeURIComponent(code)}`);
  const html = await res.text();
  const match = html.match(/href="(?:\/bourse\/[^"]*)?\/cours\/([^/"]+)\/?"/);

  if (!match) throw new Error(`Symbol not found for ISIN: ${code}`);
  return match[1];
}
