export interface PriceData {
  open: number;
  high: number;
  low: number;
  current: number;
  volume: number;
}

export interface Tick extends PriceData {
  timestamp: number;
}

export interface Change {
  value: number;
  percent: number;
}

export interface StockInfo {
  symbol: string;
  isin: string;
  exchange: string;
  eligibility: string[];
  provider: string;
  issuer: string;
  sector: string;
  index: string;
}

export interface StockQuote {
  name: string;
  symbol: string;
  info?: StockInfo;
  yesterday: PriceData;
  today: PriceData;
  change: Change;
  ticks: Tick[];
}
