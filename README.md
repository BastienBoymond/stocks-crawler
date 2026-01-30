# stocks-crawler

Minimal TypeScript library to fetch stock quotes from Boursorama.

## Installation

```bash
npm install stocks-crawler
```

## Usage

```typescript
import { getQuote, getLastPrice, getStockInfo } from "stocks-crawler";

// Get current price (supports ISIN or symbol)
const price = await getLastPrice("FR0000120073"); // Air Liquide
console.log(price); // 158.34

// Get full quote with price data
const quote = await getQuote("1rPAI");
console.log(quote.today.current);  // Current price
console.log(quote.change.percent); // Daily change %

// Get quote with stock info
const data = await getQuote("FR0000120073", true);
console.log(data.name);           // AIR LIQUIDE
console.log(data.info?.exchange); // Euronext Paris
console.log(data.info?.sector);   // Chimie de base
console.log(data.info?.index);    // CAC 40
```

## API

### `getLastPrice(code: string): Promise<number>`

Returns the current price for a stock.

- `code` - ISIN (e.g., `FR0000120073`) or Boursorama symbol (e.g., `1rPAI`)

### `getQuote(code: string, includeInfo?: boolean): Promise<StockQuote>`

Returns full quote data including prices and daily change.

- `code` - ISIN or symbol
- `includeInfo` - Set to `true` to fetch additional stock info (exchange, sector, etc.)

### `getStockInfo(code: string): Promise<StockInfo | null>`

Returns stock metadata (exchange, ISIN, sector, eligibility).

### `searchSymbol(query: string): Promise<string | null>`

Search for a Boursorama symbol by ISIN or name.

## Types

```typescript
interface StockQuote {
  name: string;
  symbol: string;
  info?: StockInfo;
  yesterday: PriceData;
  today: PriceData;
  change: Change;
  ticks: Tick[];
}

interface PriceData {
  open: number;
  high: number;
  low: number;
  current: number;
  volume: number;
}

interface Change {
  value: number;
  percent: number;
}

interface StockInfo {
  symbol: string;
  isin: string;
  exchange: string;
  eligibility: string[];
  provider: string;
  issuer: string;
  sector: string;
  index: string;
}
```

## Supported Securities

- Stocks (Actions)
- ETFs / Trackers
- Any security listed on Boursorama

## License

MIT
