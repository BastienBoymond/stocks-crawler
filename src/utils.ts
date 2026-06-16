import type { PriceData, Tick, Change, StockInfo } from "./types.js";

export const BASE_URL = "https://www.boursorama.com";
export const API_URL = `${BASE_URL}/bourse/action/graph/ws`;

export function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

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
    value: round4(value),
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

export async function fetchCoursPage(symbol: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/cours/${symbol}/`);
  return res.text();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

export function parseName(html: string): string | null {
  // Title format: "NAME Cours Action AI, ..." (stocks) or
  // "NAME, Cours Tracker CW8, ..." (ETFs). Take the text before " Cours <word>".
  const title = html.match(/<title>(.*?),?\s+Cours\s+\S/i);
  if (title) return decodeEntities(title[1].trim());

  const faceplate = html.match(/title="Cours\s+([^"]+)"/i);
  if (faceplate) return decodeEntities(faceplate[1].trim());

  return null;
}

export function parseStockInfo(html: string, fallbackSymbol: string): StockInfo | null {
  const jsonMatch = html.match(/\{[^}]*"fv_code_isin"[^}]*\}/);
  if (!jsonMatch) return null;

  try {
    const data = JSON.parse(jsonMatch[0]);
    return {
      symbol: data.fv_symb_societe || fallbackSymbol,
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
